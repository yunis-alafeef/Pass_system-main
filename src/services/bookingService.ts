/**
 * bookingService.ts — خدمة الحجوزات (المهمة 4.5)
 * إرسال طلب الحجز للخلفية (POST /bookings) وجلب حجوزات المستخدم (GET /bookings/my)
 * وتفاصيل حجز محدد (GET /bookings/:id).
 * في الوضع التجريبي: يُحفظ الحجز في localStorage (نفس مفتاح authService) ويعمل التطبيق كاملاً.
 */

import { api, isBackendLikelyDown } from '../api';
import { Booking, PaymentMethod, Passenger, Trip } from '../types';
import { ApiBooking, mapApiBookingToBooking } from '../types/api';
import type { DataSource } from './tripService';

const BOOKINGS_KEY = 'user_bookings';

export interface CreateBookingPayload {
  trip: Trip;
  seats: string[];
  passengers: Passenger[];
  paymentMethod: PaymentMethod;
  totalPriceYER: number;
  totalPriceSAR: number;
}

// ================== الوضع التجريبي ==================

const readLocalBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
};

const writeLocalBookings = (bookings: Booking[]): void => {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

const demoCreateBooking = (payload: CreateBookingPayload): Booking => {
  const booking: Booking = {
    id: `BK-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    bookingCode: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
    trip: payload.trip,
    seats: payload.seats,
    passengers: payload.passengers,
    totalPriceYER: payload.totalPriceYER,
    totalPriceSAR: payload.totalPriceSAR,
    paymentMethod: payload.paymentMethod,
    paymentStatus: 'paid',
    bookingDate: new Intl.DateTimeFormat('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date()),
  };

  writeLocalBookings([booking, ...readLocalBookings()]);
  return booking;
};

// ================== استدعاءات الخلفية ==================

const fetchMyBookingsFromApi = async (): Promise<Booking[]> => {
  const { data } = await api.get<ApiBooking[]>('/bookings/my');
  return data.map(mapApiBookingToBooking);
};

const fetchBookingFromApi = async (id: string): Promise<Booking> => {
  const { data } = await api.get<ApiBooking>(`/bookings/${id}`);
  return mapApiBookingToBooking(data);
};

const createBookingOnApi = async (payload: CreateBookingPayload): Promise<Booking> => {
  const { data } = await api.post<ApiBooking>('/bookings', {
    tripId: payload.trip.id,
    seats: payload.seats,
    passengers: payload.passengers,
    paymentMethod: payload.paymentMethod,
    totalYer: payload.totalPriceYER,
    totalSar: payload.totalPriceSAR,
  });
  return mapApiBookingToBooking(data);
};

// ================== الواجهة العامة ==================

/** إنشاء حجز جديد — يحاول الخلفية ثم يرجع للوضع التجريبي */
export const createBooking = async (payload: CreateBookingPayload): Promise<{ booking: Booking; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const booking = await createBookingOnApi(payload);
      return { booking, source: 'api' };
    } catch (error) {
      // رد خطأ صريح من الخلفية (مقعد محجوز، بيانات ناقصة...) → نمرره للمستخدم
      if ((error as { response?: unknown }).response) throw error;
      // خطأ شبكة → وضع تجريبي
    }
  }
  return { booking: demoCreateBooking(payload), source: 'demo' };
};

/** حجوزات المستخدم الحالي */
export const getMyBookings = async (): Promise<{ bookings: Booking[]; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const bookings = await fetchMyBookingsFromApi();
      return { bookings, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) throw error;
    }
  }
  return { bookings: readLocalBookings(), source: 'demo' };
};

/** تفاصيل حجز محدد بالمعرّف */
export const getBookingById = async (id: string): Promise<{ booking: Booking | null; source: DataSource }> => {
  if (!isBackendLikelyDown()) {
    try {
      const booking = await fetchBookingFromApi(id);
      return { booking, source: 'api' };
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        return { booking: null, source: 'api' };
      }
    }
  }
  const local = readLocalBookings().find((b) => b.id === id || b.bookingCode === id) ?? null;
  return { booking: local, source: 'demo' };
};
