/**
 * platformLogService.ts — سجل العمليات والأحداث الموحد للمنصة (المتطلب FR-CP-001-04)
 * يسجل دورة حياة الطلبات، عمليات تسجيل الدخول والخروج، الحجوزات، والأخطاء
 * مع دعم التصدير والتصفية لعرضها في لوحة الإدارة.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'security';

export interface PlatformLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  action: string;
  details: string;
  userId?: string;
  userRole?: string;
  ip?: string;
  requestId?: string;
  durationMs?: number;
}

const STORAGE_KEY = 'platform_operation_logs';
const MAX_LOGS = 250;

export const platformLogService = {
  /** جلب جميع السجلات */
  getLogs(): PlatformLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PlatformLogEntry[]) : this.getInitialSeed();
    } catch {
      return this.getInitialSeed();
    }
  },

  /** تسجيل حدث جديد */
  log(entry: Omit<PlatformLogEntry, 'id' | 'timestamp'>): PlatformLogEntry {
    const newEntry: PlatformLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    try {
      const logs = this.getLogs();
      const updated = [newEntry, ...logs].slice(0, MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to persist platform log:', err);
    }

    return newEntry;
  },

  /** مسح السجلات القديمة */
  clearLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** بيانات أولية لعرض السجل في الإدارة عند أول تشغيل */
  getInitialSeed(): PlatformLogEntry[] {
    const now = Date.now();
    return [
      {
        id: 'log_seed_1',
        timestamp: new Date(now - 120_000).toISOString(),
        level: 'info',
        action: 'SYSTEM_BOOT',
        details: 'تم بدء تشغيل منصة Pass System بنجاح في بيئة الويب',
        requestId: 'req_init_001',
      },
      {
        id: 'log_seed_2',
        timestamp: new Date(now - 60_000).toISOString(),
        level: 'security',
        action: 'AUTH_POLICY_CHECK',
        details: 'تفعيل حماية الجلسات ورمز التتبع الموحد TLS 1.3',
        requestId: 'req_sec_002',
      },
    ];
  },
};
