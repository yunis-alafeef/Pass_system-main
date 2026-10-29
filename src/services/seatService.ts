/**
 * seatService.ts — خدمة المقاعد (المهمة 4.4)
 * جلب مخط مقاعد الرحلة من الخلفية + تحجز مؤقتاً (Hold) عبر الـ API،
 * مع وضع تجريبي يولّد تخطيط 4×10 محلياً عندما تكون الخلفية غير متاحة.
 * التحديثات اللحظية (WebSocket) موجودة في realtime/seatSocket.ts
 */

import { api, isBackendLikelyDown } from '../api';
import { Seat, SeatStatus } from '../types';
import { ApiSeat, mapApiSeatToSeat } from '../types/api';
import type { DataSource } from './tripService';

export interface SeatMapResult {
  seats: Seat[];
  totalRows: number;
  source: DataSource;
}

export interface SeatMapApiShape {
  layout?: { rows?: number; cols?: number } | null;
  seats: ApiSeat[];
}

// ================== الوضع التجريبي ==================

const TOTAL_ROWS = 10;
const SEATS_PER_ROW = 4;

/** هاش بسيط وثابت حسب معرّف الرحلة حتى تكون المقاعد المحجوزة "منطقية" لكل رحلة */
const hashId = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h;
};

export const HOLD_DURATION_SECONDS = 900; // 15 دقيقة (FR-SM-004-02)

const generateDemoSeats = (tripId: string): Seat[] => {
  const seats: Seat[] = [];
  const seed = hashId(tripId);
  const bookedCount = 4 + (seed % 6); // 4 إلى 9 مقاعد محجوزة

  for (let r = 1; r <= TOTAL_ROWS; r++) {
    for (let c = 1; c <= SEATS_PER_ROW; c++) {
      const seatNum = `${(r - 1) * SEATS_PER_ROW + c}`;
      const seatIndex = (r - 1) * SEATS_PER_ROW + c;
      let status: SeatStatus = 'available';

      // مقاعد محجوزة موزعة حسب البذرة
      if (seatIndex % 9 === seed % 9 && seats.filter((s) => s.status === 'booked').length < bookedCount) {
        status = 'booked';
      }

      const isVip = r <= 2;
      const isWindow = c === 1 || c === 4;
      const classification = isVip ? 'vip' : isWindow ? 'window' : 'aisle';

      seats.push({
        id: `${tripId}-seat-${seatNum}`,
        seatNumber: seatNum,
        status,
        row: r,
        col: c,
        isVip,
        classification,
        extraPriceYER: isVip ? 3000 : 0,
      });
    }
  }
  return seats;
};

// ================== استدعاءات الخلفية ==================

const fetchSeatMapFromApi = async (tripId: string): Promise<SeatMapResult> => {
  const { data } = await api.get<SeatMapApiShape>(`/seats/${tripId}`);
  const seats = (data.seats ?? []).map(mapApiSeatToSeat);
  return {
    seats,
    totalRows: data.layout?.rows ?? Math.max(1, Math.ceil(seats.length / SEATS_PER_ROW) || TOTAL_ROWS),
    source: 'api',
  };
};

export const holdSeatOnApi = async (tripId: string, seatId: string): Promise<void> => {
  await api.post(`/seats/${tripId}/hold`, { seatId });
};

export const releaseSeatOnApi = async (tripId: string, seatId: string): Promise<void> => {
  await api.post(`/seats/${tripId}/release`, { seatId });
};

// ================== الواجهة العامة ==================

/**
 * جلب مخط مقاعد رحلة — يرجع للوضع التجريبي عند تعذر الاتصال
 */
export const getSeatMap = async (tripId: string): Promise<SeatMapResult> => {
  if (!isBackendLikelyDown()) {
    try {
      return await fetchSeatMapFromApi(tripId);
    } catch (error) {
      if ((error as { response?: unknown }).response) {
        // رحلة غير موجودة أو خطأ من الخلفية — نقع على الوضع التجريبي للعرض
        return { seats: generateDemoSeats(tripId), totalRows: TOTAL_ROWS, source: 'demo' };
      }
    }
  }
  return { seats: generateDemoSeats(tripId), totalRows: TOTAL_ROWS, source: 'demo' };
};

/**
 * حجز مؤقت (Hold) — في الوضع التجريبي ينجح دائماً محلياً
 * يعيد true إذا نجح الحجز، أو يرمي خطأ برسالة عربية إذا كان المقعد محجوزاً
 */
export const holdSeat = async (tripId: string, seatId: string): Promise<boolean> => {
  if (!isBackendLikelyDown()) {
    try {
      await holdSeatOnApi(tripId, seatId);
      return true;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 400 || status === 409) {
        throw new Error('تم اختيار هذا المقعد للتو من مسافر آخر، اختر مقعداً آخر');
      }
      if (status) throw new Error('تعذر حجز المقعد مؤقتاً، حاول مرة أخرى');
      // خطأ شبكة — نكمل محلياً (وضع تجريبي)
    }
  }
  return true;
};

/**
 * تحرير مقعد محجوز مؤقتاً — تجاهل الأخطاء (التحرير غير حرج)
 */
export const releaseSeat = async (tripId: string, seatId: string): Promise<void> => {
  if (!isBackendLikelyDown()) {
    try {
      await releaseSeatOnApi(tripId, seatId);
      return;
    } catch {
      // تجاهل — سيُحرر تلقائياً بعد انتهاء مدة الحجز المؤقت في الخلفية
    }
  }
};
