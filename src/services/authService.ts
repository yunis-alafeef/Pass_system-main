/**
 * authService.ts
 * طبقة المصادقة — واجهة موحدة للتعامل مع الـ API الخاصة بالمصادقة
 * 
 * حالياً تعمل في وضع "Mock/Demo Mode" (بيانات تجريبية داخل localStorage)
 * ويمكن استبدال الدوال بنداءات API الحقيقية عندما تكون الخلفية جاهزة،
 * لأن البنية (الأسماء وأنواع البيانات) مطابقة لتصميم 02-User-Identity-Management.md
 */

import { api, getApiErrorMessage, isBackendLikelyDown } from '../api';

// ================== الأنواع ==================

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    avatar?: string;
    role: UserRole;
    isVerified: boolean;
    createdAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface RegisterPayload {
    fullName: string;
    email: string;
    phone: string;
    password: string;
}

export interface ActiveSession {
    id: string;
    device: string;
    browser: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
}

export interface BookingHistoryItem {
    id: string;
    bookingCode: string;
    route: string;
    date: string;
    seats: string;
    priceYER: number;
    status: 'completed' | 'upcoming' | 'cancelled';
}

// ================== مفاتيح التخزين ==================

const KEYS = {
    access: 'access_token',
    refresh: 'refresh_token',
    user: 'current_user',
    remember: 'remember_me',
};

// ================== أدوات مساعدة (Token & Storage) ==================

export const tokenStore = {
    get access(): string | null {
        return localStorage.getItem(KEYS.access);
    },
    get refresh(): string | null {
        return localStorage.getItem(KEYS.refresh);
    },
    get user(): User | null {
        const raw = localStorage.getItem(KEYS.user);
        return raw ? (JSON.parse(raw) as User) : null;
    },
    get rememberMe(): boolean {
        return localStorage.getItem(KEYS.remember) === 'true';
    },
    save(tokens: AuthTokens, user: User, rememberMe: boolean) {
        localStorage.setItem(KEYS.access, tokens.accessToken);
        localStorage.setItem(KEYS.refresh, tokens.refreshToken);
        localStorage.setItem(KEYS.user, JSON.stringify(user));
        localStorage.setItem(KEYS.remember, String(rememberMe));
    },
    clear() {
        [KEYS.access, KEYS.refresh, KEYS.user, KEYS.remember].forEach((k) => localStorage.removeItem(k));
    },
};

/** فك تشفير بسيط لحمولة JWT (بدون تحقق — للعرض فقط) */
export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
};

// ================== توليد رموز تجريبية ==================

/** تحويل دور الخلفية (أحرف كبيرة) إلى دور الواجهة (أحرف صغيرة) */
const mapApiRole = (role?: string): UserRole => {
  switch (String(role ?? '').toUpperCase()) {
    case 'ADMIN':
      return 'admin';
    case 'VENDOR':
      return 'vendor';
    default:
      return 'customer';
  }
};

/** يبني JWT تجريبي (على شكل header.payload.signature) ليعمل مع AuthGuard في الوضع التجريبي */
const buildMockJwt = (user: User): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
        JSON.stringify({
            sub: user.id,
            role: user.role,
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // صالح ليوم
        })
    );
    const signature = 'mock-signature-not-for-production';
    return `${header}.${payload}.${signature}`;
};

const randomId = () => Math.random().toString(36).slice(2, 11);

// ================== المحاكاة (Mock DB) ==================

interface MockAccount extends User {
    password: string;
}

const getMockAccounts = (): MockAccount[] => {
    const raw = localStorage.getItem('mock_accounts');
    if (raw) return JSON.parse(raw);
    // حساب تجريبي افتراضي
    const seed: MockAccount[] = [
        {
            id: 'usr_001',
            fullName: 'يعقوب الحكيمي',
            email: 'yaqoub@example.com',
            phone: '+967771234567',
            avatar: 'https://i.pravatar.cc/150?u=yaqoub',
            role: 'customer',
            isVerified: true,
            createdAt: new Date().toISOString(),
            password: 'Test@1234',
        },
    ];
    localStorage.setItem('mock_accounts', JSON.stringify(seed));
    return seed;
};

const saveMockAccounts = (accounts: MockAccount[]) => {
    localStorage.setItem('mock_accounts', JSON.stringify(accounts));
};

const delay = (ms = 900) => new Promise((res) => setTimeout(res, ms));

// ================== الخدمات ==================

/**
 * استرداد كلمة المرور (2.6) — يرسل رابط/رمز الاستعادة عبر الخلفية إن توفرت
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    if (!isBackendLikelyDown()) {
        try {
            const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
            return { message: data.message ?? 'تم إرسال رابط استرداد كلمة المرور إلى بريدك' };
        } catch (error) {
            if ((error as { response?: unknown }).response) {
                throw new Error(getApiErrorMessage(error));
            }
        }
    }
    await delay(700);
    return { message: `[وضع تجريبي] تم إرسال رابط الاسترداد إلى ${email}` };
};

/** الحقول التي تعيدها الخلفية من /auth/* عند النجاح */
interface ApiAuthUser {
    id: string;
    email: string;
    role: string;
    phone?: string;
    fullName?: string;
}

interface ApiAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: ApiAuthUser;
    userId?: string;
}

/** يوحد شكل مستخدم الخلفية مع نموذج الواجهة (User) */
const mapApiUser = (u: ApiAuthUser): User => ({
    id: u.id,
    fullName: u.fullName ?? u.email.split('@')[0],
    email: u.email,
    phone: u.phone ?? '',
    role: mapApiRole(u.role),
    isVerified: true,
    createdAt: new Date().toISOString(),
});

/** يحفظ استجابة المصادقة (توكنات + مستخدم) في التخزين المحلي ويعيدها موحّدة */
const persistAuthResponse = (data: ApiAuthResponse, rememberMe: boolean): LoginResponse => {
    const user = mapApiUser(data.user);
    const tokens: AuthTokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
    tokenStore.save(tokens, user, rememberMe);
    return { user, tokens };
};

/**
 * تسجيل الدخول (المهمة 4.1/2.3)
 * يحاول API الخلفية أولاً (POST /auth/login)، وينجح في الوضع التجريبي
 * عند تعذر الوصول للخادم فقط. أخطاء الخلفية الصريحة (401/400) تمرر للمستخدم.
 */
export const login = async (
    identifier: string,
    password: string,
    rememberMe: boolean
): Promise<LoginResponse> => {
    if (!isBackendLikelyDown()) {
        try {
            const { data } = await api.post<ApiAuthResponse>('/auth/login', {
                email: identifier.trim().toLowerCase(),
                password,
            });
            return persistAuthResponse(data, rememberMe);
        } catch (error) {
            // خطأ صريح من الخلفية → رسالة واضحة للمستخدم (لا fallback صامت لتجنب إرباك الحسابات)
            if ((error as { response?: unknown }).response) {
                throw new Error(getApiErrorMessage(error));
            }
            // خطأ شبكة → نكمل بالوضع التجريبي أدناه
        }
    }

    await delay();
    const accounts = getMockAccounts();
    const acc = accounts.find(
        (a) => a.email === identifier.trim().toLowerCase() || a.phone === identifier.trim()
    );
    if (!acc) {
        throw new Error('لا يوجد حساب مرتبط بهذا البريد الإلكتروني أو رقم الهاتف');
    }
    if (acc.password !== password) {
        throw new Error('كلمة المرور غير صحيحة، حاول مرة أخرى');
    }
    const { password: _pw, ...user } = acc;
    const tokens: AuthTokens = {
        accessToken: buildMockJwt(user),
        refreshToken: `mock-refresh-${randomId()}`,
    };
    tokenStore.save(tokens, user, rememberMe);
    return { user, tokens };
};

/**
 * إنشاء الحساب (المهمتان 2.2 / 2.4)
 * يرسل POST /auth/register الحقيقي ويعيد تسجيل الدخول تلقائياً بالتوكنات الراجعة.
 * === ملاحظة معمارية مهمة ===
 * الخلفية تنشئ الحساب مباشرة ولا تملك إندبوينت OTP بعد (المهمة 2.5 مؤجلة)،
 * لذا نتعامل مع التسجيل كعملية واحدة بدل انتظار رمز تحقق غير موجود على الخادم.
 * عند إضافة /auth/otp لاحقاً، يكفي استعادة الخطوتين (stageRegistration + verifyOtp).
 */
export const register = async (payload: RegisterPayload): Promise<LoginResponse> => {
    if (!isBackendLikelyDown()) {
        try {
            const { data } = await api.post<ApiAuthResponse>('/auth/register', {
                fullName: payload.fullName.trim(),
                email: payload.email.trim().toLowerCase(),
                phone: payload.phone.trim(),
                password: payload.password,
            });
            return persistAuthResponse(data, true);
        } catch (error) {
            // رد صريح من الخلفية (بريد مكرر، بيانات ناقصة...) → نعرضه للمستخدم
            if ((error as { response?: unknown }).response) {
                throw new Error(getApiErrorMessage(error));
            }
            // خطأ شبكة → نكمل بالوضع التجريبي المحلي أدناه
        }
    }

    await delay();
    const accounts = getMockAccounts();
    if (accounts.some((a) => a.email === payload.email.trim().toLowerCase() || a.phone === payload.phone.trim())) {
        throw new Error('هذا البريد الإلكتروني أو رقم الهاتف مسجل بالفعل');
    }
    const account: MockAccount = {
        id: `usr_${randomId()}`,
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        avatar: `https://i.pravatar.cc/150?u=${randomId()}`,
        role: 'customer',
        isVerified: true,
        createdAt: new Date().toISOString(),
        password: payload.password,
    };
    accounts.push(account);
    saveMockAccounts(accounts);

    const { password: _pw, ...user } = account;
    const tokens: AuthTokens = {
        accessToken: buildMockJwt(user),
        refreshToken: `mock-refresh-${randomId()}`,
    };
    tokenStore.save(tokens, user, true);
    return { user, tokens };
};

/**
 * إرسال رمز OTP — الخلفية لا تدعمه بعد (المهمة 2.5)، فهو يعمل في الوضع التجريبي
 * (يعرض الرمز في الـ console لتمكين التجربة الكاملة محلياً).
 * TODO (Integration): استبدل بـ `return api.post('/auth/otp/send', { phone })`
 */
export const sendOtp = async (phone: string): Promise<{ devCode: string }> => {
    await delay(700);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    sessionStorage.setItem('otp_code', code);
    sessionStorage.setItem('otp_phone', phone);
    console.info(`[DEMO MODE] رمز التحقق المرسل إلى ${phone} هو: ${code}`);
    return { devCode: code };
};

/**
 * التحقق من رمز OTP وإنشاء الحساب نهائياً (وضع تجريبي فقط حالياً)
 * TODO (Integration): استبدل بـ `return api.post('/auth/otp/verify', { phone, code })`
 */
export const verifyOtp = async (code: string): Promise<LoginResponse> => {
    await delay();
    const expected = sessionStorage.getItem('otp_code');
    if (!expected) throw new Error('انتهت صلاحية الرمز، اطلب رمزاً جديداً');
    if (code !== expected) throw new Error('الرمز غير صحيح، حاول مرة أخرى');

    const pendingRaw = sessionStorage.getItem('pending_registration');
    if (!pendingRaw) throw new Error('انتهت صلاحية بيانات التسجيل، أعد المحاولة');
    const pending = JSON.parse(pendingRaw) as MockAccount;

    const accounts = getMockAccounts();
    if (accounts.some((a) => a.email === pending.email || a.phone === pending.phone)) {
        throw new Error('هذا البريد الإلكتروني أو رقم الهاتف مسجل بالفعل');
    }
    const account: MockAccount = { ...pending, isVerified: true };
    accounts.push(account);
    saveMockAccounts(accounts);

    sessionStorage.removeItem('otp_code');
    sessionStorage.removeItem('pending_registration');

    const { password: _pw, ...user } = account;
    const tokens: AuthTokens = {
        accessToken: buildMockJwt(user),
        refreshToken: `mock-refresh-${randomId()}`,
    };
    tokenStore.save(tokens, user, true);
    return { user, tokens };
};

/**
 * تخزين بيانات التسجيل مؤقتاً حتى التحقق من OTP (وضع تجريبي)
 */
export const stageRegistration = (payload: RegisterPayload): void => {
    const account: Omit<MockAccount, 'isVerified' | 'createdAt'> = {
        id: `usr_${randomId()}`,
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        avatar: `https://i.pravatar.cc/150?u=${randomId()}`,
        role: 'customer',
        password: payload.password,
    };
    sessionStorage.setItem('pending_registration', JSON.stringify(account));
};

/**
 * تسجيل الخروج (2.8)
 * يبلّغ الخلفية لإبطال جلسة هذا الجهاز، ثم يفرغ التخزين المحلي دائماً
 * (حتى لو فشل الاتصال — الأمان يقتضي ألا يبقى التوكن في المتصفح).
 */
export const logout = async (): Promise<void> => {
    const refreshToken = tokenStore.refresh;
    try {
        if (!isBackendLikelyDown()) {
            await api.post('/auth/logout', { refreshToken });
        }
    } catch {
        // نتجاهل خطأ الخادم — الخروج المحلي يجب أن ينجح دائماً
    } finally {
        tokenStore.clear();
    }
};

/**
 * تحديث بيانات الملف الشخصي (2.9) — PATCH /auth/me
 * الخلفية تقبل الاسم والصورة فقط (البريد/الهاتف حقول هوية غير قابلة للتعديل من هنا).
 */
export const updateProfile = async (data: Partial<Pick<User, 'fullName' | 'phone' | 'avatar'>>): Promise<User> => {
    const current = tokenStore.user;
    if (!current) throw new Error('غير مصرح — سجل الدخول أولاً');

    if (!isBackendLikelyDown()) {
        try {
            const { data: res } = await api.patch<ApiAuthUser>('/auth/me', {
                fullName: data.fullName,
                avatar: data.avatar,
            });
            const updated: User = { ...current, ...mapApiUser(res) };
            localStorage.setItem(KEYS.user, JSON.stringify(updated));
            return updated;
        } catch (error) {
            if ((error as { response?: unknown }).response) {
                throw new Error(getApiErrorMessage(error));
            }
            // خطأ شبكة → نكمل بالوضع التجريبي
        }
    }

    await delay(600);
    const accounts = getMockAccounts();
    const idx = accounts.findIndex((a) => a.id === current.id);
    if (idx >= 0) {
        accounts[idx] = { ...accounts[idx], ...data };
        saveMockAccounts(accounts);
    }
    const updated: User = { ...current, ...data };
    localStorage.setItem(KEYS.user, JSON.stringify(updated));
    return updated;
};

/**
 * تغيير كلمة المرور (2.9) — POST /auth/change-password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!isBackendLikelyDown()) {
        try {
            await api.post('/auth/change-password', { currentPassword, newPassword });
            return;
        } catch (error) {
            // الخلفية تعيد 400 مع رسالة عربية عند خطأ كلمة المرور الحالية
            if ((error as { response?: unknown }).response) {
                throw new Error(getApiErrorMessage(error));
            }
        }
    }

    await delay(700);
    const current = tokenStore.user;
    if (!current) throw new Error('غير مصرح — سجل الدخول أولاً');
    const accounts = getMockAccounts();
    const idx = accounts.findIndex((a) => a.id === current.id);
    if (idx < 0) throw new Error('الحساب غير موجود');
    if (accounts[idx].password !== currentPassword) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
    }
    accounts[idx].password = newPassword;
    saveMockAccounts(accounts);
};

/**
 * جلب الجلسات النشطة (2.8) — GET /auth/sessions
 * نرسل refresh token الجهاز الحالي في الهيئة لتمييز جلستنا بـ isCurrent.
 */
export const getActiveSessions = async (): Promise<ActiveSession[]> => {
    if (!isBackendLikelyDown()) {
        try {
            const { data } = await api.get<Array<{ id: string; device: string; lastActive: string; isCurrent: boolean }>>(
                '/auth/sessions',
                { data: { refreshToken: tokenStore.refresh } }
            );
            return data.map((s) => ({
                id: s.id,
                device: s.device,
                browser: '',
                ip: '—',
                lastActive: s.isCurrent
                    ? 'نشط الآن'
                    : new Intl.DateTimeFormat('ar-YE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s.lastActive)),
                isCurrent: s.isCurrent,
            }));
        } catch (error) {
            if ((error as { response?: unknown }).response) throw new Error(getApiErrorMessage(error));
        }
    }

    await delay(500);
    return [
        { id: 'sess_1', device: 'Google Chrome', browser: 'Windows 11', ip: '192.168.1.5', lastActive: 'نشط الآن', isCurrent: true },
        { id: 'sess_2', device: 'Safari', browser: 'iPhone 14', ip: '10.0.0.8', lastActive: 'آخر نشاط: أمس 10:30 م', isCurrent: false },
    ];
};

/**
 * إنهاء جلسة محددة — DELETE /auth/sessions/:id
 * === درس: نجاح صامت للخدمات الثانوية ===
 * فشل إلغاء جلسة لا يجب أن يُظهر شاشة خطأ حمراء — الجلسة ستُبطل بانتهاء صلاحيتها تلقائياً.
 */
export const revokeSession = async (sessionId: string): Promise<void> => {
    if (!isBackendLikelyDown()) {
        try {
            await api.delete(`/auth/sessions/${sessionId}`);
        } catch {
            // تجاهل — انظر التعليق أعلاه
        }
    }
};

/**
 * إنهاء جميع الجلسات الأخرى — POST /auth/sessions/revoke-all
 */
export const revokeAllOtherSessions = async (): Promise<void> => {
    if (!isBackendLikelyDown()) {
        try {
            await api.post('/auth/sessions/revoke-all', { refreshToken: tokenStore.refresh });
        } catch {
            // تجاهل — انظر التعليق أعلاه
        }
    }
};

/**
 * جلب سجل الحجوزات من التخزين المحلي (التجريبي)
 * TODO (Integration): استبدل بـ `return api.get('/bookings/my')`
 */
export const getBookingHistory = async (): Promise<BookingHistoryItem[]> => {
    await delay(500);
    const raw = localStorage.getItem('user_bookings');
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return parsed.map((b: { id: string; bookingCode: string; trip: { vendorName: string; origin: string; destination: string }; bookingDate: string; seats: string[]; totalPriceYER: number }) => ({
            id: b.id,
            bookingCode: b.bookingCode,
            route: `${b.trip.origin} → ${b.trip.destination}`,
            date: b.bookingDate,
            seats: b.seats.join(', '),
            priceYER: b.totalPriceYER,
            status: 'upcoming' as const,
        }));
    } catch {
        return [];
    }
};

/** حفظ حجز جديد في السجل (يستدعى من BookingFormModal مستقبلاً) */
export const addBookingToHistory = (booking: unknown): void => {
    const existing = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    existing.unshift(booking);
    localStorage.setItem('user_bookings', JSON.stringify(existing));
};

/**
 * جلب حساب مزود (اختياري) — للتوافق مع التوسع المستقبلي
 * TODO: expand when Vendor module is ready
 */
export const getCurrentUser = (): User | null => tokenStore.user;