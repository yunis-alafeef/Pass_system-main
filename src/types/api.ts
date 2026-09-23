/**
 * api.ts (types) — أنواع عقود الـ API والمحوّلات (Mappers)
 * تحوّل الردود الخام القادمة من الخلفية (Prisma Shape) إلى أنواع الواجهة المحلية
 * المعرّفة في types/index.ts حتى تبقى المكونات مستقلة عن شكل قاعدة البيانات.
 */

import { Booking, Passenger, PaymentMethod, Seat, SeatStatus, Trip, TripType, Vendor } from './index';

// ================== أشكال الردود الخام من الخلفية ==================

/** شكل Trip كما تعيده Prisma (مع العلاقات المضمّنة) */
export interface ApiTrip {
  id: string;
  vendorId: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  priceYer: number;
  priceSar?: number | null;
  status?: string;
  route?: {
    id?: string;
    origin: string;
    destination: string;
    type?: string;
    duration?: number | null; // بالدقائق
  } | null;
  vendor?: {
    id: string;
    name: string;
    rating?: number | null;
    city?: string | null;
  } | null;
  seats?: Array<{ id: string; status: string; seatNumber: string; type?: string; row: number; col: number }>;
  _count?: { seats?: number; bookings?: number };
}

export interface ApiSeat {
  id: string;
  seatNumber: string;
  row: number;
  col: number;
  type?: string;
  status: string;
}

export interface ApiVendor {
  id: string;
  name: string;
  city?: string | null;
  phone?: string | null;
  rating?: number | null;
  status?: string;
  _count?: { trips?: number };
}

// ================== أدوات تنسيق ==================

/** تنسيق توقيت (ISO) إلى صيغة عربية مقروءة مثل "08:00 صباحاً" */
export const formatTimeAr = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat('ar', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return iso;
  }
};

/** تحويل الدقائق إلى نص مدة عربي مثل "8 ساعات" */
export const formatDurationAr = (minutes?: number | null): string => {
  if (!minutes || minutes <= 0) return 'غير محدد';
  const hours = Math.round(minutes / 60);
  return hours === 1 ? 'ساعة واحدة' : `${hours} ساعات`;
};

/** نسبة تحويل تقديرية YER → SAR عند غياب السعر من الخلفية (1 ر.س ≈ 400 ر.ي) */
const YER_PER_SAR = 400;

const mapTripType = (type?: string | null): TripType =>
  String(type ?? '').toUpperCase() === 'INTERNATIONAL' ? 'international' : 'internal';

/** تحويل نص حالة المقعد في الخلفية إلى حالة الواجهة */
export const mapSeatStatus = (raw: string): SeatStatus => {
  switch (String(raw).toUpperCase()) {
    case 'AVAILABLE':
      return 'available';
    case 'HELD':
    case 'BOOKED':
    case 'DISABLED':
      return 'booked';
    default:
      return 'booked';
  }
};

// ================== المحوّلات ==================

/** تحويل رحلة خام من الخلفية إلى نموذج الواجهة */
export const mapApiTripToTrip = (raw: ApiTrip): Trip => {
  const route = raw.route;
  const vendor = raw.vendor;

  const seats = raw.seats ?? [];
  const totalSeats = seats.length > 0 ? seats.length : (raw._count?.seats ?? 0);
  const availableSeats =
    seats.length > 0 ? seats.filter((s) => String(s.status).toUpperCase() === 'AVAILABLE').length : totalSeats;

  const priceYER = raw.priceYer ?? 0;
  const priceSAR = raw.priceSar ?? Math.round(priceYER / YER_PER_SAR);

  return {
    id: raw.id,
    vendorId: vendor?.id ?? raw.vendorId,
    vendorName: vendor?.name ?? 'مكتب نقل',
    vendorRating: vendor?.rating ?? 0,
    origin: route?.origin ?? 'غير محدد',
    destination: route?.destination ?? 'غير محدد',
    departureTime: formatTimeAr(raw.departureTime),
    arrivalTime: formatTimeAr(raw.arrivalTime),
    duration: formatDurationAr(route?.duration),
    priceYER,
    priceSAR,
    availableSeats,
    totalSeats,
    busType: (raw.busType as Trip['busType']) ?? 'عادي المطور',
    tripType: mapTripType(route?.type),
    features: [],
  };
};

/** تحويل مقعد خام من الخلفية إلى نموذج الواجهة */
export const mapApiSeatToSeat = (raw: ApiSeat): Seat => ({
  id: raw.id,
  seatNumber: raw.seatNumber,
  status: mapSeatStatus(raw.status),
  isVip: String(raw.type ?? '').toUpperCase() === 'VIP',
  row: raw.row,
  col: raw.col,
});

/** تحويل مزود خام من الخلفية إلى نموذج الواجهة */
export const mapApiVendorToVendor = (raw: ApiVendor): Vendor => ({
  id: raw.id,
  name: raw.name,
  city: raw.city ?? 'غير محدد',
  phone: raw.phone ?? 'غير متوفر',
  rating: raw.rating ?? 0,
  totalTrips: raw._count?.trips ?? 0,
  verified: String(raw.status ?? '').toUpperCase() === 'ACTIVE',
});

// ================== أشكال الحجز ==================

export interface ApiBooking {
  id: string;
  bookingCode: string;
  totalYer?: number | null;
  totalSar?: number | null;
  paymentStatus?: string;
  status?: string;
  createdAt?: string;
  trip?: ApiTrip | null;
  passengers?: Array<{
    id?: string;
    seatId?: string;
    fullName: string;
    identityNumber?: string | null;
    phone?: string | null;
    gender?: string | null;
    seat?: { seatNumber: string } | null;
  }>;
}

const mapPaymentMethod = (method?: string | null): PaymentMethod => {
  const m = String(method ?? '').toLowerCase();
  if (['kureimi', 'kurami'].includes(m)) return 'kureimi';
  if (m === 'tadamon') return 'tadamon';
  if (m === 'jawwal') return 'jawwal';
  if (['visa', 'card'].includes(m)) return 'visa';
  return 'cash';
};

/** تحويل حجز خام من الخلفية إلى نموذج الواجهة */
export const mapApiBookingToBooking = (raw: ApiBooking): Booking => {
  const trip: Trip = raw.trip ? mapApiTripToTrip(raw.trip) : FALLBACK_TRIP;

  const passengers: Passenger[] = (raw.passengers ?? []).map((p, idx) => ({
    seatNumber: p.seat?.seatNumber ?? `-${idx + 1}`,
    fullName: p.fullName,
    identityNumber: p.identityNumber ?? '—',
    phone: p.phone ?? '—',
    gender: String(p.gender ?? 'male').toLowerCase() === 'female' ? 'female' : 'male',
  }));

  return {
    id: raw.id,
    bookingCode: raw.bookingCode,
    trip,
    seats: passengers.map((p) => p.seatNumber),
    passengers,
    totalPriceYER: raw.totalYer ?? 0,
    totalPriceSAR: raw.totalSar ?? 0,
    paymentMethod: mapPaymentMethod((raw as { paymentMethod?: string }).paymentMethod),
    paymentStatus:
      String(raw.paymentStatus ?? '').toUpperCase() === 'COMPLETED' ? 'paid' : 'pending',
    bookingDate: raw.createdAt
      ? new Intl.DateTimeFormat('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(raw.createdAt))
      : '—',
  };
};

/** رحلة بديلة عند غياب علاقة الحجز (لتفادي انهيار الواجهة) */
const FALLBACK_TRIP: Trip = {
  id: 'unknown',
  vendorId: 'unknown',
  vendorName: 'مكتب نقل',
  vendorRating: 0,
  origin: 'غير محدد',
  destination: 'غير محدد',
  departureTime: '—',
  arrivalTime: '—',
  duration: '—',
  priceYER: 0,
  priceSAR: 0,
  availableSeats: 0,
  totalSeats: 0,
  busType: 'عادي المطور',
  tripType: 'internal',
  features: [],
};
