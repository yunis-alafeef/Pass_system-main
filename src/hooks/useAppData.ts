/**
 * useAppData.ts — طبقة React Query (المهمة 4.2)
 * مجمّع موحد لكل query/mutation keys وhooks المستخدمة في التطبيق،
 * بحيث تكون أسماء الكاش متسقة وقابلة للإبطال (invalidate) بعد التغييرات.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSeatMap, holdSeat, releaseSeat } from '../services/seatService';
import { getTripById, searchTrips, type TripSearchFilters } from '../services/tripService';
import { createBooking, getBookingById, getMyBookings, type CreateBookingPayload } from '../services/bookingService';
import { createVendorTrip, getVendorStats, getVendorTrips } from '../services/vendorService';
import { getPlatformStats, getVendors, updateVendorStatus } from '../services/adminService';
import { Seat, SeatStatus } from '../types';

// ================== Query Keys ==================

export const qk = {
  trips: (filters: TripSearchFilters) => ['trips', filters] as const,
  trip: (id: string) => ['trip', id] as const,
  seatMap: (tripId: string) => ['seats', tripId] as const,
  myBookings: () => ['bookings', 'my'] as const,
  booking: (id: string) => ['booking', id] as const,
  vendorTrips: () => ['vendor', 'trips'] as const,
  vendorStats: () => ['vendor', 'stats'] as const,
  adminStats: () => ['admin', 'stats'] as const,
  vendors: () => ['admin', 'vendors'] as const,
};

// ================== الرحلات (4.3) ==================

export const useTrips = (filters: TripSearchFilters) =>
  useQuery({
    queryKey: qk.trips(filters),
    queryFn: () => searchTrips(filters),
    staleTime: 30_000,
  });

export const useTrip = (id: string) =>
  useQuery({
    queryKey: qk.trip(id),
    queryFn: () => getTripById(id),
    enabled: !!id,
    staleTime: 60_000,
  });

// ================== المقاعد (4.4) ==================

export const useSeatMap = (tripId: string) =>
  useQuery({
    queryKey: qk.seatMap(tripId),
    queryFn: () => getSeatMap(tripId),
    enabled: !!tripId,
    staleTime: 15_000,
  });

/** حجز مؤقت لمقعد (Hold) — يحدّث كاش المقاعد عند النجاح */
export const useHoldSeat = (tripId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seatId: string) => holdSeat(tripId, seatId),
    onSuccess: (_data, seatId) => {
      queryClient.setQueryData<{ seats: Array<Seat & { status: SeatStatus }>; totalRows: number }>(
        qk.seatMap(tripId),
        (old) =>
          old
            ? {
                ...old,
                seats: old.seats.map((s) => (s.id === seatId ? { ...s, status: 'booked' as SeatStatus } : s)),
              }
            : old
      );
    },
  });
};

/** تحرير مقعد محجوز مؤقتاً */
export const useReleaseSeat = (tripId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seatId: string) => releaseSeat(tripId, seatId),
    onSuccess: (_data, seatId) => {
      queryClient.setQueryData<{ seats: Array<Seat & { status: SeatStatus }>; totalRows: number }>(
        qk.seatMap(tripId),
        (old) =>
          old
            ? {
                ...old,
                seats: old.seats.map((s) => (s.id === seatId ? { ...s, status: 'available' as SeatStatus } : s)),
              }
            : old
      );
    },
  });
};

// ================== الحجوزات (4.5) ==================

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.myBookings() });
    },
  });
};

export const useMyBookings = () =>
  useQuery({
    queryKey: qk.myBookings(),
    queryFn: () => getMyBookings(),
    staleTime: 30_000,
  });

export const useBooking = (id: string) =>
  useQuery({
    queryKey: qk.booking(id),
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });

// ================== لوحة المزودين (4.6) ==================

export const useVendorTrips = () =>
  useQuery({
    queryKey: qk.vendorTrips(),
    queryFn: () => getVendorTrips(),
    staleTime: 30_000,
  });

export const useVendorStats = () =>
  useQuery({
    queryKey: qk.vendorStats(),
    queryFn: () => getVendorStats(),
    staleTime: 60_000,
  });

export const useCreateVendorTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorTrip,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendor', 'trips'] });
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

// ================== لوحة الإدارة (4.7) ==================

export const useAdminStats = () =>
  useQuery({
    queryKey: qk.adminStats(),
    queryFn: () => getPlatformStats(),
    staleTime: 60_000,
  });

export const useVendors = () =>
  useQuery({
    queryKey: qk.vendors(),
    queryFn: () => getVendors(),
    staleTime: 60_000,
  });

export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, status }: { vendorId: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      updateVendorStatus(vendorId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.vendors() });
    },
  });
};
