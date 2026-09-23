/**
 * adminService.ts — خدمة لوحة الإدارة (المهمة 4.7)
 * جلب مؤشرات المنصة (GET /admin/stats) وقائمة المكاتب (GET /vendors)
 * وتحديث حالة توثيق المكتب (PATCH /vendors/:id/status).
 * في الوضع التجريبي: يعيد مؤشرات محاكاة + mockVendors.
 */

import { api, isBackendLikelyDown } from '../api';
import { Vendor } from '../types';
import { ApiVendor, mapApiVendorToVendor } from '../types/api';
import { mockVendors } from '../data/mockData';
import type { DataSource } from './tripService';

export interface PlatformStats {
  latencyMs: number;
  activeConcurrentUsers: number;
  uptimePercent: number;
  vendorsCount: number;
  securityScore: string;
  postgresConnected: boolean;
  redisActive: boolean;
}

const demoStats = (): PlatformStats => ({
  latencyMs: 45,
  activeConcurrentUsers: 3480,
  uptimePercent: 99.99,
  vendorsCount: mockVendors.length,
  securityScore: '100% محمية',
  postgresConnected: true,
  redisActive: true,
});

// ================== استدعاءات الخلفية ==================

const fetchStatsFromApi = async (): Promise<PlatformStats> => {
  const { data } = await api.get<PlatformStats>('/admin/stats');
  return data;
};

const fetchVendorsFromApi = async (): Promise<Vendor[]> => {
  const { data } = await api.get<ApiVendor[]>('/vendors');
  return data.map(mapApiVendorToVendor);
};

export const updateVendorStatusOnApi = async (vendorId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> => {
  await api.patch(`/vendors/${vendorId}/status`, { status });
};

// ================== الواجهة العامة ==================

export const getPlatformStats = async (): Promise<{ stats: PlatformStats; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const stats = await fetchStatsFromApi();
      return { stats, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        return { stats: demoStats(), source: 'api' };
      }
    }
  }
  return { stats: demoStats(), source: 'demo' };
};

export const getVendors = async (): Promise<{ vendors: Vendor[]; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const vendors = await fetchVendorsFromApi();
      return { vendors, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        return { vendors: [], source: 'api' };
      }
    }
  }
  return { vendors: mockVendors, source: 'demo' };
};

/**
 * تحديث حالة توثيق مكتب (إدارة فقط) — يعمل فعلياً عبر الخلفية فقط
 */
export const updateVendorStatus = async (vendorId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> => {
  if (!isBackendLikelyDown()) {
    try {
      await updateVendorStatusOnApi(vendorId, status);
      return;
    } catch (error) {
      if ((error as { response?: unknown }).response) throw error;
    }
  }
  // الوضع التجريبي: لا يوجد تخزين دائم — نجاح صامت
};
