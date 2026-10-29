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
import { generateInvoice, processRefund } from './paymentService';
import { platformLogService } from './platformLogService';

const BOOKINGS_KEY = 'user_bookings';

export interface CreateBookingPayload {
  trip: Trip;
  seats: string[];
  passengers: Passenger[];
  paymentMethod: PaymentMethod;
  totalPriceYER: number;
  totalPriceSAR: number;
  baggageCount?: number;
  baggageExtraFeeYER?: number;
  specialAssistance?: boolean;
}

export interface CancelBookingPayload {
  bookingId: string;
  reason?: string;
}

export interface CancelBookingResult {
  booking: Booking;
  refundedAmountYER: number;
  cancellationFeeYER: number;
  refundedAmountSAR: number;
  source: DataSource;
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
  const invoice = generateInvoice(
    `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
    payload.totalPriceYER
  );

  const booking: Booking = {
    id: `BK-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    bookingCode: invoice.invoiceNumber.replace('INV-', 'PASS-'),
    trip: payload.trip,
    seats: payload.seats,
    passengers: payload.passengers,
    totalPriceYER: payload.totalPriceYER,
    totalPriceSAR: payload.totalPriceSAR,
    paymentMethod: payload.paymentMethod,
    paymentStatus: 'paid',
    status: 'confirmed',
    bookingDate: new Intl.DateTimeFormat('ar-YE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date()),
    baggageCount: payload.baggageCount || 1,
    baggageExtraFeeYER: payload.baggageExtraFeeYER || 0,
    specialAssistance: payload.specialAssistance || false,
    invoice,
  };

  writeLocalBookings([booking, ...readLocalBookings()]);
  platformLogService.log({
    level: 'info',
    action: 'BOOKING_CREATED',
    details: `حجز جديد برقم ${booking.bookingCode} للرحلة ${booking.trip.origin} ➔ ${booking.trip.destination} - مقاعد: ${booking.seats.join(',')} - الإجمالي: ${booking.totalPriceYER} ر.ي`,
  });

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
    baggageCount: payload.baggageCount,
    specialAssistance: payload.specialAssistance,
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
      if ((error as { response?: unknown }).response) throw error;
    }
  }
  return { booking: demoCreateBooking(payload), source: 'demo' };
};

/** إلغاء حجز مع تطبيق شروط وسياسة الإلغاء والاسترداد المالي (FR-BM-004 & BR-BM-004) */
export const cancelBooking = async (
  bookingId: string,
  reason = 'إلغاء بناءً على رغبة العميل'
): Promise<CancelBookingResult> => {
  if (!isBackendLikelyDown()) {
    try {
      const { data } = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      return {
        booking: mapApiBookingToBooking(data.booking),
        refundedAmountYER: data.refundedAmountYER,
        cancellationFeeYER: data.cancellationFeeYER,
        refundedAmountSAR: data.refundedAmountSAR,
        source: 'api',
      };
    } catch (error) {
      if ((error as { response?: unknown }).response) throw error;
    }
  }

  // معالجة محلية تجريبية
  const allBookings = readLocalBookings();
  const index = allBookings.findIndex((b) => b.id === bookingId || b.bookingCode === bookingId);
  if (index === -1) {
    throw new Error('الحجز غير موجود لإلغائه');
  }

  const booking = allBookings[index];
  const refundResult = await processRefund(
    booking.id,
    booking.totalPriceYER,
    booking.paymentMethod,
    undefined,
    reason
  );

  const updatedBooking: Booking = {
    ...booking,
    status: 'cancelled',
    paymentStatus: 'refunded',
    cancellationDate: new Date().toISOString(),
    cancellationReason: reason,
    cancellationFeeYER: refundResult.cancellationFeeYER,
    refundedAmountYER: refundResult.refundedAmountYER,
  };

  allBookings[index] = updatedBooking;
  writeLocalBookings(allBookings);

  platformLogService.log({
    level: 'warn',
    action: 'BOOKING_CANCELLED',
    details: `تم إلغاء الحجز ${booking.bookingCode} واسترداد ${refundResult.refundedAmountYER} ر.ي (رسوم الإلغاء: ${refundResult.cancellationFeeYER} ر.ي)`,
  });

  return {
    booking: updatedBooking,
    refundedAmountYER: refundResult.refundedAmountYER,
    cancellationFeeYER: refundResult.cancellationFeeYER,
    refundedAmountSAR: refundResult.refundedAmountSAR,
    source: 'demo',
  };
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

