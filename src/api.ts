/**
 * api.ts — عميل HTTP موحد للمشروع (المهمة 4.1)
 * الميزات:
 *  - Axios instance مهيأ من متغيرات البيئة (VITE_API_URL)
 *  - Request Interceptor : يرفق JWT تلقائياً من localStorage
 *  - Response Interceptor: عند 401 يحاول تحديث الـ Token مرة واحدة (single-flight)
 *    ثم يعيد إرسال الطلب الأصلي، وعند فشل التحديث يسجّل الخروج وينقل للمستخدم لصفحة الدخول
 *  - تتبع صحة الخلفية: عند تعذر الوصول للخادم يفعّل "الوضع التجريبي" مؤقتاً
 *    بدل تعطيل الواجهة، حتى تكون المنصة قابلة للعرض دون خلفية
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// ================== الإعدادات ==================

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const WS_BASE_URL = (import.meta.env.VITE_WS_URL as string) || '';
export const FORCE_MOCK_API = String(import.meta.env.VITE_USE_MOCK_API) === 'true';

// المفاتيح المعتمدة في التخزين المحلي (مطابقة لـ authService)
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

// ================== إنشاء النسخة ==================

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ================== صحة الخلفية (Demo Fallback) ==================

/** متى يُسمح بمحاولة الاتصال بالخلفية مجدداً (0 = الخلفية متاحة) */
let backendDownUntil = 0;

/** هل يُتوقع أن الخلفية غير متاحة الآن؟ */
export const isBackendLikelyDown = (): boolean =>
  FORCE_MOCK_API || Date.now() < backendDownUntil;

/** تعليم الخلفية كغير متاحة لفترة (لتجنب مهلات طويلة متكررة) */
export const markBackendDown = (ms = 60_000): void => {
  backendDownUntil = Date.now() + ms;
};

/** تعليم الخلفية كمتاحة (عند أي استجابة ناجحة) */
export const markBackendUp = (): void => {
  backendDownUntil = 0;
};

/** هل الخطأ "تعذر الوصول للخادم" وليس رداً خاطئاً منه؟ */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && error.code !== 'ECONNABORTED';
  }
  return false;
};

// ================== Request Interceptor (JWT) ==================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================== تحديث الـ Token (Single-Flight) ==================

const AUTH_FREE_URLS = ['/auth/login', '/auth/register', '/auth/otp', '/auth/refresh'];

let refreshPromise: Promise<string> | null = null;

/** ينفذ طلب تحديث الـ Token مرة واحدة فقط حتى لو تزامنت عدة 401 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

  // نستخدم axios الخام لتجنب الالتقاط الدائري للـ interceptors
  const { data } = await axios.post<{ accessToken: string; refreshToken?: string }>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    { timeout: 10000 }
  );

  const newAccess = data.accessToken;
  if (!newAccess) throw new Error('INVALID_REFRESH_RESPONSE');

  localStorage.setItem(TOKEN_KEY, newAccess);
  if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
  return newAccess;
};

/** مسح الجلسة محلياً والانتقال لصفحة الدخول */
const forceLogout = (): void => {
  [TOKEN_KEY, REFRESH_KEY, 'current_user', 'remember_me'].forEach((k) =>
    localStorage.removeItem(k)
  );
  // نستخدم توجيهاً كاملاً لتفريغ كل حالة التطبيق
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

// ================== Response Interceptor (Refresh on 401) ==================

api.interceptors.response.use(
  (response) => {
    markBackendUp();
    return response;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    // 1) خطأ شبكة (الخلفية متوقفة) → تفعيل الوضع التجريبي مؤقتاً
    if (!error.response) {
      markBackendDown();
      return Promise.reject(error);
    }

    markBackendUp();

    // 2) 401 → محاولة تحديث الـ Token ثم إعادة الطلب مرة واحدة
    const url = originalConfig?.url ?? '';
    const isAuthFreeCall = AUTH_FREE_URLS.some((p) => url.includes(p));

    if (error.response.status === 401 && originalConfig && !originalConfig._retried && !isAuthFreeCall) {
      originalConfig._retried = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalConfig as AxiosRequestConfig);
      } catch {
        forceLogout();
      }
    }

    // 3) فشل تحديث الـ Token نفسه (endpoint غير موجود / refresh منتهي)
    if (error.response.status === 401 && url.includes('/auth/refresh')) {
      forceLogout();
    }

    return Promise.reject(error);
  }
);

// ================== أدوات مساعدة للأخطاء ==================

interface ApiErrorShape {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/** استخراج رسالة خطأ عربية واضحة من رد الخلفية أو الخطأ العام */
export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (isNetworkError(error)) {
      return 'تعذر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مجدداً';
    }
    const data = error.response?.data as ApiErrorShape | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (error.response?.status === 401) return 'بيانات الدخول غير صحيحة';
    if (error.response?.status === 403) return 'ليست لديك صلاحية لتنفيذ هذا الإجراء';
    if (error.response?.status === 404) return 'العنصر المطلوب غير موجود';
    if (error.response?.status && error.response.status >= 500) {
      return 'حدث خطأ في الخادم، حاول مرة أخرى لاحقاً';
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'حدث خطأ غير متوقع، حاول مرة أخرى';
};

export default api;
