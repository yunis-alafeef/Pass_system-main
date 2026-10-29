/**
 * vendorService.ts — خدمة لوحة المزودين (المهمة 4.6)
 * جلب رحلات وإحصائيات المكتب + إنشاء رحلة جديدة عبر POST /trips.
 * في الوضع التجريبي: يحسب الإحصائيات من mockTrips لمكتب البراق (v1).
 */

import { api, isBackendLikelyDown } from '../api';
import { Trip } from '../types';
import { ApiTrip, mapApiTripToTrip } from '../types/api';
import { mockTrips } from '../data/mockData';
import type { DataSource } from './tripService';

export interface VendorStats {
  totalTrips: number;
  totalBookings: number;
  totalRevenueYER: number;
  occupancyRate: number;
  rating: number;
  seatCapacity: number;
}

// ================== الوضع التجريبي ==================

const DEMO_VENDOR_TRIPS = () => mockTrips.filter((t) => t.vendorId === 'v1');

const demoStats = (): VendorStats => {
  const trips = DEMO_VENDOR_TRIPS();
  const totalRevenueYER = trips.reduce((sum, t) => sum + t.priceYER * (t.totalSeats - t.availableSeats), 0);
  const totalSeats = trips.reduce((sum, t) => sum + t.totalSeats, 0);
  const available = trips.reduce((sum, t) => sum + t.availableSeats, 0);
  const booked = totalSeats - available;
  return {
    totalTrips: trips.length,
    totalBookings: 1420, // رقم إجمالي تراكمي للعرض التجريبي
    totalRevenueYER: totalRevenueYER || 49_700_000,
    occupancyRate: totalSeats > 0 ? Math.round((booked / totalSeats) * 100) : 0,
    rating: 4.9,
    seatCapacity: totalSeats,
  };
};

// ================== استدعاءات الخلفية ==================

const fetchVendorTripsFromApi = async (): Promise<Trip[]> => {
  const { data } = await api.get<ApiTrip[]>('/trips', { params: { mine: 'true' } });
  return data.map(mapApiTripToTrip);
};

const fetchVendorStatsFromApi = async (): Promise<VendorStats> => {
  const { data } = await api.get<VendorStats>('/vendors/me/stats');
  return data;
};

export interface CreateTripPayload {
  origin: string;
  destination: string;
  departureTime: string;
  priceYER: number;
  priceSAR?: number;
  busType?: string;
}

const createTripOnApi = async (payload: CreateTripPayload): Promise<Trip> => {
  const { data } = await api.post<ApiTrip>('/trips', {
    origin: payload.origin,
    destination: payload.destination,
    departureTime: payload.departureTime,
    priceYer: payload.priceYER,
    priceSar: payload.priceSAR,
    busType: payload.busType ?? 'VIP الممتاز',
  });
  return mapApiTripToTrip(data);
};

// ================== الواجهة العامة ==================

import { VendorContract, VendorKYCDocuments, TripLifecycleStatus } from '../types';
import { getVendorPayouts, requestVendorPayout } from './paymentService';

export interface VendorContractDetails {
  contract: VendorContract;
  documents: VendorKYCDocuments;
  branches: string[];
}

export const getVendorContractDetails = (vendorId = 'v1'): VendorContractDetails => {
  const storedContract = localStorage.getItem(`vendor_contract_${vendorId}`);
  if (storedContract) {
    return JSON.parse(storedContract);
  }

  const defaultContract: VendorContractDetails = {
    contract: {
      contractId: `CTR-${vendorId}-2026`,
      commissionRate: 5.0, // 5% عمولة المنصة
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      isActive: true,
      autoRenew: true,
    },
    documents: {
      commercialRegistryNumber: 'CR-YE-889921',
      transportLicenseNumber: 'MOT-7721-A',
      taxNumber: 'TAX-00984',
      licenseExpiryDate: '2027-12-31',
      verifiedAt: '2026-01-10',
    },
    branches: ['صنعاء - التحرير', 'صنعاء - باب اليمن', 'عدن - المنصورة', 'تعز - الحوبان', 'المكلا - الديس'],
  };

  localStorage.setItem(`vendor_contract_${vendorId}`, JSON.stringify(defaultContract));
  return defaultContract;
};

export const updateVendorCommission = (vendorId: string, commissionRate: number): void => {
  const current = getVendorContractDetails(vendorId);
  current.contract.commissionRate = commissionRate;
  localStorage.setItem(`vendor_contract_${vendorId}`, JSON.stringify(current));
};

export const updateTripLifecycleStatus = async (
  tripId: string,
  status: TripLifecycleStatus
): Promise<{ tripId: string; status: TripLifecycleStatus }> => {
  if (!isBackendLikelyDown()) {
    try {
      await api.patch(`/trips/${tripId}/status`, { status });
      return { tripId, status };
    } catch {
      // fallback
    }
  }

  // تحديث محلي تجريبي
  const trips = DEMO_VENDOR_TRIPS();
  const trip = trips.find((t) => t.id === tripId);
  if (trip) {
    trip.status = status;
  }
  return { tripId, status };
};

export { getVendorPayouts, requestVendorPayout };

export const getVendorTrips = async (): Promise<{ trips: Trip[]; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const trips = await fetchVendorTripsFromApi();
      return { trips, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        return { trips: [], source: 'api' };
      }
    }
  }
  return { trips: DEMO_VENDOR_TRIPS(), source: 'demo' };
};

export const getVendorStats = async (): Promise<{ stats: VendorStats; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const stats = await fetchVendorStatsFromApi();
      return { stats, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        return { stats: demoStats(), source: 'api' };
      }
    }
  }
  return { stats: demoStats(), source: 'demo' };
};

/**
 * إنشاء رحلة جديدة (vendor فقط) — في الوضع التجريبي يرجع كائناً محلياً
 */
export const createVendorTrip = async (payload: CreateTripPayload & { busType?: string; status?: TripLifecycleStatus; recurrence?: 'daily' | 'weekly' | 'none' }): Promise<{ trip: Trip; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const trip = await createTripOnApi(payload);
      return { trip, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) throw error;
    }
  }

  const demoTrip: Trip = {
    id: `trip-${Date.now()}`,
    vendorId: 'v1',
    vendorName: 'شركة البراق للنقل الدولي والمحلي',
    vendorRating: 4.9,
    origin: payload.origin,
    destination: payload.destination,
    departureTime: payload.departureTime,
    arrivalTime: '—',
    duration: 'غير محدد',
    priceYER: Number(payload.priceYER),
    priceSAR: Number(payload.priceSAR ?? Math.round(Number(payload.priceYER) / 400)),
    availableSeats: 45,
    totalSeats: 45,
    busType: (payload.busType as Trip['busType']) || 'VIP الممتاز',
    tripType: payload.destination.includes('السعودية') ? 'international' : 'internal',
    status: payload.status || 'SCHEDULED',
    recurrence: payload.recurrence || 'none',
    features: ['واي فاي مجاني', 'مكيف هواء', 'شاحن لكل مقعد'],
  };
  return { trip: demoTrip, source: 'demo' };
};

