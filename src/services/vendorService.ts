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
export const createVendorTrip = async (payload: CreateTripPayload): Promise<{ trip: Trip; source: DataSource }> => {
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
    busType: 'VIP الممتاز',
    tripType: payload.destination.includes('السعودية') ? 'international' : 'internal',
    features: ['واي فاي مجاني', 'مكيف هواء', 'شاحن لكل مقعد'],
  };
  return { trip: demoTrip, source: 'demo' };
};
