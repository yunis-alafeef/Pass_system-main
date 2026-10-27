/**
 * platformConfigService.ts — إدارة تكوين وإعدادات المنصة (المتطلب FR-CP-003)
 * يتيح تعديل إعدادات التشغيل الحية (المهلة، العمولة، وضع الصيانة) بدون إعادة تشغيل
 * ويسجل جميع التغييرات في سجل التدقيق (Audit Log).
 */

import { platformLogService } from './platformLogService';

export interface PlatformConfig {
  appName: string;
  version: string;
  maintenanceMode: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  platformCommissionPercent: number;
  emergencySupportPhone: string;
  allowInternationalRoutes: boolean;
  defaultCurrency: 'YER' | 'SAR';
}

const DEFAULT_CONFIG: PlatformConfig = {
  appName: 'Pass System',
  version: '1.0.0',
  maintenanceMode: false,
  sessionTimeoutMinutes: 30,
  maxFailedLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  platformCommissionPercent: 7.5,
  emergencySupportPhone: '+967 771 234 567',
  allowInternationalRoutes: true,
  defaultCurrency: 'YER',
};

const CONFIG_STORAGE_KEY = 'platform_runtime_config';

export const platformConfigService = {
  /** قراءة التكوين الحالي */
  getConfig(): PlatformConfig {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Failed to parse runtime config:', e);
    }
    return { ...DEFAULT_CONFIG };
  },

  /** تحديث إعدادات المنصة وتسجيل التعديل في سجل العمليات */
  updateConfig(updates: Partial<PlatformConfig>, changedBy = 'مدير النظام'): PlatformConfig {
    const current = this.getConfig();
    const updated: PlatformConfig = { ...current, ...updates };

    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));

      platformLogService.log({
        level: 'warn',
        action: 'CONFIG_UPDATED',
        details: `تحديث إعدادات المنصة بواسطة ${changedBy}: ${Object.keys(updates).join(', ')}`,
        userRole: 'admin',
      });
    } catch (e) {
      console.error('Failed to save config:', e);
    }

    return updated;
  },

  /** استعادة الإعدادات الافتراضية */
  resetDefaults(): PlatformConfig {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    platformLogService.log({
      level: 'warn',
      action: 'CONFIG_RESET',
      details: 'تمت استعادة الإعدادات الافتراضية للمنصة',
      userRole: 'admin',
    });
    return { ...DEFAULT_CONFIG };
  },
};
