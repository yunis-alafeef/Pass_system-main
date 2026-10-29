/**
 * BookingDetailsPage.tsx — تفاصيل الحجز (/booking/:id) (المهمة 4.5)
 * يجلب بيانات الحجز من الخلفية عبر useBooking ويعرض حالة التذكرة،
 * المقاعد المحجوزة، وسعرها مع الخطوات القادمة (الدفع).
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Check, Clock, AlertCircle, ArrowRight, Printer, RotateCw,
  XCircle, Share2, FileText, ShieldAlert,
} from 'lucide-react';
import { useBooking } from '../hooks/useAppData';
import { cancelBooking } from '../services/bookingService';
import { calculateRefundAmount } from '../services/paymentService';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'بانتظار الدفع', color: '#ffbe0b', icon: <Clock size={14} /> },
  paid: { label: 'مدفوع ومؤكد', color: '#00f5d4', icon: <Check size={14} /> },
  failed: { label: 'فشل الدفع', color: '#ff006e', icon: <AlertCircle size={14} /> },
  refunded: { label: 'مسترد وملغى', color: '#a855f7', icon: <XCircle size={14} /> },
  cancelled: { label: 'ملغى', color: '#ef4444', icon: <XCircle size={14} /> },
};

const BookingDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useBooking(id);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('تغيير خطط السفر الشخصية');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  if (isLoading) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <RotateCw size={36} color="#3a86ff" style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: '#fff', fontSize: '1.2rem' }}>جاري جلب تفاصيل الحجز...</h2>
        </div>
      </div>
    );
  }

  const booking = data?.booking;

  if (!booking || isError) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <AlertCircle size={44} color="#ff006e" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>الحجز غير موجود</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>تأكد من صحة رقم الحجز أو راجع قائمة حجوزاتك.</p>
          <Link to="/my-tickets" className="btn-primary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem' }}>
            <ArrowRight size={18} /> إلى حجوزاتي
          </Link>
        </div>
      </div>
    );
  }

  const effectiveStatus = booking.status === 'cancelled' ? 'cancelled' : booking.paymentStatus;
  const cfg = statusConfig[effectiveStatus] || statusConfig.pending;
  const pricePerSeatYER = booking.seats.length ? Math.round(booking.totalPriceYER / booking.seats.length) : 0;
  const refundPolicy = calculateRefundAmount(booking.totalPriceYER);

  const handleCancelBooking = async () => {
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelBooking(booking.id, cancelReason);
      setShowCancelModal(false);
      await refetch();
    } catch (err: unknown) {
      setCancelError((err as Error).message || 'تعذر إلغاء الحجز');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎫 تفاصيل حجز وتذكرة Pass System\n` +
      `رقم الحجز: #${booking.bookingCode}\n` +
      `شركة النقل: ${booking.trip.vendorName}\n` +
      `المسار: ${booking.trip.origin} ➔ ${booking.trip.destination}\n` +
      `الموعد: ${booking.trip.departureTime}\n` +
      `المقاعد: ${booking.seats.join(', ')}\n` +
      `الحالة: ${cfg.label}\n` +
      `المبلغ: ${booking.totalPriceYER.toLocaleString()} ر.ي`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <button onClick={() => navigate('/my-tickets')} className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        <ArrowRight size={16} /> رجوع إلى حجوزاتي
      </button>

      {/* Top Banner Header */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: `${cfg.color}22`, color: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem auto', fontSize: '2rem',
        }}>
          {effectiveStatus === 'cancelled' || effectiveStatus === 'refunded' ? '✕' : effectiveStatus === 'pending' ? '⏳' : '✓'}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
          {effectiveStatus === 'cancelled' || effectiveStatus === 'refunded'
            ? 'تم إلغاء هذا الحجز ومعالجة الاسترداد'
            : effectiveStatus === 'pending'
            ? 'بانتظار إتمام الدفع'
            : 'حجز مؤكد وتذكرة جاهزة للرحلة'}
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.25rem' }}>رقم الحجز: #{booking.bookingCode || booking.id}</p>

        <span className="badge" style={{ background: `${cfg.color}18`, color: cfg.color, padding: '0.4rem 1rem' }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Booking Details Grid */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>المسار</div>
            <div style={{ fontWeight: 700, color: '#fff' }}>{booking.trip.origin} ➔ {booking.trip.destination}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>شركة النقل</div>
            <div style={{ fontWeight: 700, color: '#fff' }}>{booking.trip.vendorName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>وقت المغادرة</div>
            <div style={{ fontWeight: 700, color: '#00f5d4' }}>{booking.trip.departureTime}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>المقاعد</div>
            <div style={{ fontWeight: 700, color: '#ffbe0b' }}>{booking.seats.join(', ')}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>الأمتعة المشحونة</div>
            <div style={{ fontWeight: 700, color: '#fff' }}>{booking.baggageCount || 1} حقائب</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>طريقة الدفع</div>
            <div style={{ fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>{booking.paymentMethod}</div>
          </div>
        </div>

        {/* Passenger details */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#00f5d4', fontWeight: 700, marginBottom: '0.5rem' }}>بيانات المسافرين المسجلين:</div>
          {booking.passengers.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', padding: '0.3rem 0', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>• {p.fullName} (مقعد {p.seatNumber})</span>
              <span style={{ color: '#94a3b8' }}>هوية: {p.identityNumber} • هاتف: {p.phone}</span>
            </div>
          ))}
        </div>

        {/* Cancellation Details if cancelled */}
        {booking.status === 'cancelled' && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={18} /> سجل الإلغاء والاسترداد المالي (FR-BM-004 / FR-PF-008)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>رسوم الإلغاء المقتطعة: <strong style={{ color: '#ffbe0b' }}>{(booking.cancellationFeeYER || 0).toLocaleString()} ر.ي</strong></div>
              <div>المبلغ المسترد للعميل: <strong style={{ color: '#00f5d4' }}>{(booking.refundedAmountYER || booking.totalPriceYER).toLocaleString()} ر.ي</strong></div>
              <div>سبب الإلغاء: <span>{booking.cancellationReason || 'طلب العميل'}</span></div>
            </div>
          </div>
        )}

        {/* Pricing & Actions */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>الإجمالي ({booking.seats.length} تذكرة × {pricePerSeatYER.toLocaleString()} ر.ي)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00f5d4' }}>
              {booking.totalPriceYER.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>ر.ي</span>
              <span style={{ fontSize: '1rem', color: '#ffbe0b', marginRight: '0.5rem' }}>({booking.totalPriceSAR} ر.س)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }} onClick={() => window.print()}>
              <Printer size={16} /> طباعة التذكرة
            </button>
            <button className="btn-secondary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', color: '#25d366' }} onClick={handleShareWhatsApp}>
              <Share2 size={16} /> مشاركة
            </button>
            <button className="btn-secondary" style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }} onClick={() => setShowInvoice(!showInvoice)}>
              <FileText size={16} /> {showInvoice ? 'إخفاء الفاتورة' : 'الفاتورة الرسمية'}
            </button>
            {booking.status !== 'cancelled' && (
              <button
                className="btn-secondary"
                style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', color: '#ff006e', borderColor: 'rgba(255,0,110,0.4)' }}
                onClick={() => setShowCancelModal(true)}
              >
                <XCircle size={16} /> إلغاء الحجز والاسترداد
              </button>
            )}
          </div>
        </div>

        {/* Invoice View */}
        {showInvoice && (
          <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginTop: '1.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#00f5d4" /> الفاتورة الضريبية الرسمية - Pass System
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div>رقم الفاتورة: <strong style={{ color: '#fff' }}>INV-{booking.bookingCode}</strong></div>
              <div>تاريخ الإصدار: <span>{booking.bookingDate}</span></div>
              <div>عمولة المنصة: <span>{((booking.totalPriceYER * 5) / 100).toLocaleString()} ر.ي (5%)</span></div>
              <div>صافي مكتب النقل: <span>{((booking.totalPriceYER * 95) / 100).toLocaleString()} ر.ي</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ff006e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={22} /> تأكيد إلغاء الحجز واسترداد المبلغ
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              {refundPolicy.policyNote}
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>إجمالي الحجز:</span>
                <span style={{ color: '#fff' }}>{booking.totalPriceYER.toLocaleString()} ر.ي</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>رسوم الإلغاء ({refundPolicy.feePercentage}%):</span>
                <span style={{ color: '#ff006e' }}>- {refundPolicy.cancellationFeeYER.toLocaleString()} ر.ي</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontWeight: 800 }}>
                <span style={{ color: '#fff' }}>المبلغ المسترد لمحفظتك:</span>
                <span style={{ color: '#00f5d4' }}>{refundPolicy.refundedAmountYER.toLocaleString()} ر.ي ({refundPolicy.refundedAmountSAR} ر.س)</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '0.3rem' }}>سبب الإلغاء:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', background: '#090d16', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontFamily: 'Cairo' }}
              >
                <option value="تغيير خطط السفر الشخصية">تغيير خطط السفر الشخصية</option>
                <option value="تغيير موعد الرحلة">تغيير موعد الرحلة</option>
                <option value="ظروف طارئة">ظروف طارئة</option>
                <option value="حجز بالخطأ">حجز بالخطأ</option>
              </select>
            </div>

            {cancelError && (
              <div style={{ color: '#ff8a8a', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>
                تراجع
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="btn-primary"
                style={{ background: '#ff006e', borderColor: '#ff006e', padding: '0.6rem 1.4rem' }}
              >
                {cancelLoading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء الفوري'}
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '1.5rem' }}>
        احتفظ برقم الحجز لعرضه عند الصعود إلى الحافلة. يمكنك أيضاً متابعة حالة الحجز من صفحة "حجوزاتي".
      </p>
    </div>
  );
};

export default BookingDetailsPage;

