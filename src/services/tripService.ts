/**
 * tripService.ts — خدمة الرحلات (المهمة 4.3)
 * تتعامل مع الخلفية عبر /trips، وعند تعذر الوصول للخادم تعمل
 * تلقائياً في "الوضع التجريبي" على بيانات mockData حتى لا تتعطل الواجهة.
 */

import { api, isBackendLikelyDown } from '../api';
import { Trip, TripType } from '../types';
import { ApiTrip, mapApiTripToTrip } from '../types/api';
import { mockTrips } from '../data/mockData';

export type DataSource = 'api' | 'demo';

export interface TripSearchFilters {
  origin?: string;
  destination?: string;
  date?: string;
  tripType?: TripType | 'all';
}

export interface TripsResult {
  trips: Trip[];
  source: DataSource;
}

// ================== الوضع التجريبي ==================

const demoSearchTrips = (filters: TripSearchFilters): Trip[] => {
  let result = [...mockTrips];

  if (filters.origin) {
    result = result.filter((t) => t.origin.includes(filters.origin!));
  }
  if (filters.destination) {
    result = result.filter((t) => t.destination.includes(filters.destination!));
  }
  if (filters.tripType && filters.tripType !== 'all') {
    result = result.filter((t) => t.tripType === filters.tripType);
  }
  // ملاحظة: بيانات الوضع التجريبي لا تحمل تواريخ فعلية، لذا يُتجاهل فلتر التاريخ هنا
  return result;
};

const demoGetTrip = (id: string): Trip | null =>
  mockTrips.find((t) => t.id === id) ?? null;

// ================== استدعاءات الخلفية ==================

const fetchTripsFromApi = async (filters: TripSearchFilters): Promise<Trip[]> => {
  const params: Record<string, string> = {};
  if (filters.origin) params.origin = filters.origin;
  if (filters.destination) params.destination = filters.destination;
  if (filters.date) params.date = filters.date;
  if (filters.tripType && filters.tripType !== 'all') params.type = filters.tripType;

  const { data } = await api.get<ApiTrip[]>('/trips', { params });
  return data.map(mapApiTripToTrip);
};

const fetchTripFromApi = async (id: string): Promise<Trip> => {
  const { data } = await api.get<ApiTrip>(`/trips/${id}`);
  return mapApiTripToTrip(data);
};

// ================== الواجهة العامة ==================

/**
 * البحث عن الرحلات — يحاول الخلفية أولاً ثم يرجع للوضع التجريبي عند فشل الاتصال
 */
export const searchTrips = async (filters: TripSearchFilters): Promise<TripsResult> => {
  if (!isBackendLikelyDown()) {
    try {
      const trips = await fetchTripsFromApi(filters);
      return { trips, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        // رد خطأ من الخلفية نفسها (404/500...) — لا نتجاهله بصمت، نعرض نتائج فارغة
        return { trips: [], source: 'api' };
      }
    }
  }
  return { trips: demoSearchTrips(filters), source: 'demo' };
};

/**
 * جلب تفاصيل رحلة محددة عبر المعرّف
 */
export const getTripById = async (id: string): Promise<{ trip: Trip | null; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const trip = await fetchTripFromApi(id);
      return { trip, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        return { trip: null, source: 'api' };
      }
    }
  }
  return { trip: demoGetTrip(id), source: 'demo' };
};
