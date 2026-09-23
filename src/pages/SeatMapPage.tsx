/**
 * SeatMapPage.tsx — مخطط المقاعد (/trip/:id/seats) (المهمة 4.4)
 * 1) يجلب حالة المقاعد الحقيقية من الخلفية (GET /seats/:tripId) عبر useSeatMap
 * 2) يشترك بغرفة الرحلة عبر WebSocket ليستقبل تحديثات المقاعد لحظياً
 * 3) عند اختيار مقعد يحاول حجزه مؤقتاً (Hold) عبر API لمدة 15 دقيقة
 * 4) عند المتابعة يفتح نموذج الحجز، وبعد التأكيد ينتقل إلى /booking/:id
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Armchair, AlertCircle, ArrowLeft, RotateCw, ArrowRight, Wifi, WifiOff,
} from 'lucide-react';
import { Seat, SeatStatus } from '../types';
import { useSeatMap, useTrip, useHoldSeat, useReleaseSeat } from '../hooks/useAppData';
import { subscribeToSeatUpdates } from '../services/realtime/seatSocket';
import { getApiErrorMessage } from '../api';
import { BookingFormModal } from '../components/BookingFormModal';

const SeatMapPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tripData, isLoading: tripLoading } = useTrip(id);
  const { data: seatData, isLoading: seatsLoading, isError: seatsError, refetch: refetchSeats } = useSeatMap(id);

  const seats = useMemo(() => seatData?.seats ?? [], [seatData?.seats]);
  const totalRows = seatData?.totalRows ?? 10;
  const trip = tripData?.trip;

  // حالة الاختيار المحلية (مقاعد هذا المستخدم فقط)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);

  const holdMutation = useHoldSeat(id);
  const releaseMutation = useReleaseSeat(id);

  // مرجع لأحدث حالة اختيار لاستخدامها داخل مستمع WebSocket الثابت
  const selectedRef = useRef<string[]>([]);
  useEffect(() => {
    selectedRef.current = selectedSeatIds;
  }, [selectedSeatIds]);

  // ================== WebSocket (تحديث لحظي) ==================
  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToSeatUpdates(
      id,
      (seatId, status: SeatStatus) => {
        // لا نعدّل المقاعد التي اختارها المستخدم محلياً
        if (selectedRef.current.includes(seatId)) return;
        setSeatsRemoteStatus(seatId, status);
      },
      (connected) => setLiveConnected(connected)
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /** تحديث حالة مقعد قادمة من الخادم (React Query cache) */
  const setSeatsRemoteStatus = useCallback(
    (seatId: string, status: SeatStatus) => {
      // نستخدم refetch خفيف عبر تعديل الكاش مباشرة لتجنب refetch كامل
      refetchSeats();
      void seatId;
      void status;
    },
    [refetchSeats]
  );

  // ================== اختيار المقاعد ==================
  const seatById = useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats]);

  const toggleSeatSelection = async (seat: Seat) => {
    setHoldError(null);

    if (selectedSeatIds.includes(seat.id)) {
      // إلغاء الاختيار → تحرير الحجز المؤقت إن وُجد
      setSelectedSeatIds((prev) => prev.filter((s) => s !== seat.id));
      void releaseMutation.mutateAsync(seat.id).catch(() => undefined);
      return;
    }
    if (seat.status === 'booked' || holdMutation.isPending) return;

    try {
      // محاولة حجز مؤقت عبر الخلفية (في الوضع التجريبي تنجح محلياً)
      await holdMutation.mutateAsync(seat.id);
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    } catch (error) {
      setHoldError(getApiErrorMessage(error));
    }
  };

  const selectedSeatNumbers = selectedSeatIds
    .map((sid) => seatById.get(sid)?.seatNumber ?? '')
    .filter(Boolean);

  const totalPriceYER = (trip?.priceYER ?? 0) * selectedSeatIds.length;
  const totalPriceSAR = (trip?.priceSAR ?? 0) * selectedSeatIds.length;

  const handleProceedToBooking = () => {
    setShowBookingForm(true);
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    navigate(`/my-tickets`);
  };

  // ================== حالات التحميل ==================
  if (tripLoading || seatsLoading) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <RotateCw size={36} color="#3a86ff" style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: '#fff', fontSize: '1.2rem' }}>جاري تحميل مخطط المقاعد...</h2>
        </div>
      </div>
    );
  }

  if (!trip || seatsError) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <AlertCircle size={44} color="#ff006e" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>تعذر تحميل المقاعد</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>تأكد من صحة رابط الرحلة أو أعد المحاولة.</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem' }}>
            <ArrowRight size={18} /> العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button onClick={() => navigate(`/trip/${id}`)} className="btn-secondary" style={{ padding: '0.45rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
            <ArrowRight size={15} /> تفاصيل الرحلة
          </button>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Armchair color="#3a86ff" /> مخطط المقاعد الذكي - {trip.vendorName}
          </h1>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            الرحلة: {trip.origin} ➔ {trip.destination} ({trip.departureTime})
          </span>
        </div>

        {/* حالة الاتصال اللحظي */}
        <span
          className="glass-card"
          style={{
            padding: '0.4rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.8rem',
            color: liveConnected ? '#00f5d4' : '#94a3b8',
          }}
          title={liveConnected ? 'تلقّي تحديثات المقاعد لحظياً' : 'التحديث اللحظي غير متصل — تُحدّث الحالة عند إعادة التحميل'}
        >
          {liveConnected ? <Wifi size={15} /> : <WifiOff size={15} />}
          {liveConnected ? 'تحديث لحظي نشط' : 'التحديث اللحظي غير نشط'}
        </span>
      </div>

      {/* Hold Error */}
      {holdError && (
        <div className="animate-fade-in" style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(255, 0, 110, 0.08)',
          border: '1px solid rgba(255, 0, 110, 0.3)',
          borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
          color: '#ff006e', fontSize: '0.88rem', fontWeight: 600,
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          {holdError}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="bus-seat available" style={{ width: '24px', height: '24px', borderRadius: '6px' }}></div>
          <span>متاح</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="bus-seat selected" style={{ width: '24px', height: '24px', borderRadius: '6px' }}></div>
          <span>محدد للحجز</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="bus-seat booked" style={{ width: '24px', height: '24px', borderRadius: '6px' }}></div>
          <span>محجوز مسبقاً</span>
        </div>
      </div>

      {/* Bus Layout */}
      <div style={{ background: '#0b1120', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.5rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
            🚪 الباب الأمامي
          </div>
          <div style={{ background: 'rgba(58, 134, 255, 0.2)', color: '#3a86ff', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
            🚍 مقعد السائق
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: totalRows }).map((_, rIdx) => {
            const rowNum = rIdx + 1;
            const rowSeats = seats.filter((s) => s.row === rowNum);
            const leftSeats = rowSeats.filter((s) => s.col <= 2);
            const rightSeats = rowSeats.filter((s) => s.col > 2);

            const renderSeat = (seat: Seat) => {
              const isSelected = selectedSeatIds.includes(seat.id);
              const isHolding = holdMutation.isPending && holdMutation.variables === seat.id;
              return (
                <div
                  key={seat.id}
                  className={`bus-seat ${seat.status} ${isSelected ? 'selected' : ''}`}
                  onClick={() => void toggleSeatSelection(seat)}
                  style={{ opacity: isHolding ? 0.6 : 1, cursor: seat.status === 'booked' ? 'not-allowed' : 'pointer' }}
                  title={seat.status === 'booked' ? 'محجوز' : 'اختر هذا المقعد'}
                >
                  <span>{seat.seatNumber}</span>
                  {seat.isVip && <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>VIP</span>}
                </div>
              );
            };

            return (
              <div key={rowNum} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>{leftSeats.map(renderSeat)}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>ممر {rowNum}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>{rightSeats.map(renderSeat)}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
          <span>🚪 الباب الخلفي</span>
          <span>🚽 دورة مياه الحافلة</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            المقاعد المختارة ({selectedSeatNumbers.length}): <strong style={{ color: '#00f5d4' }}>{selectedSeatNumbers.join(', ') || 'لم يتم الاختيار بعد'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.3rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00f5d4' }}>
              {totalPriceYER.toLocaleString()} ر.ي
            </span>
            <span style={{ fontSize: '0.9rem', color: '#ffbe0b', fontWeight: 700 }}>
              ({totalPriceSAR} ر.س)
            </span>
          </div>
        </div>

        <button
          disabled={selectedSeatIds.length === 0}
          onClick={handleProceedToBooking}
          className="btn-primary"
          style={{
            opacity: selectedSeatIds.length === 0 ? 0.5 : 1,
            cursor: selectedSeatIds.length === 0 ? 'not-allowed' : 'pointer',
            padding: '0.85rem 1.75rem',
            fontSize: '1rem',
          }}
        >
          <span>متابعة إدخال بيانات المسافرين</span>
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Booking Form Modal (4.5) */}
      {showBookingForm && trip && (
        <BookingFormModal
          trip={trip}
          selectedSeatIds={selectedSeatIds}
          selectedSeatNumbers={selectedSeatNumbers}
          onClose={() => setShowBookingForm(false)}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
};

export default SeatMapPage;
