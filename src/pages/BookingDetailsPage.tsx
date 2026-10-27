/**
 * BookingDetailsPage.tsx — تفاصيل الحجز (/booking/:id) (المهمة 4.5)
 * يجلب بيانات الحجز من الخلفية عبر useBooking ويعرض حالة التذكرة،
 * المقاعد المحجوزة، وسعرها مع الخطوات القادمة (الدفع).
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Check, Clock, AlertCircle, ArrowRight, Printer, CreditCard, RotateCw,
} from 'lucide-react';
import { useBooking } from '../hooks/useAppData';
import type { Booking } from '../types';

const statusConfig: Record<Booking['paymentStatus'], { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'بانتظار الدفع', color: '#ffbe0b', icon: <Clock size={14} /> },
  paid: { label: 'مدفوع ومؤكد', color: '#00f5d4', icon: <Check size={14} /> },
  failed: { label: 'فشل الدفع', color: '#ff006e', icon: <AlertCircle size={14} /> },
};

const BookingDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useBooking(id);

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

  const cfg = statusConfig[booking.paymentStatus];
  const pricePerSeatYER = booking.seats.length ? booking.totalPriceYER / booking.seats.length : 0;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <button onClick={() => navigate('/my-tickets')} className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        <ArrowRight size={16} /> رجوع إلى حجوزاتي
      </button>

      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: `${cfg.color}22`, color: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem auto', fontSize: '2rem',
        }}>
          {booking.paymentStatus === 'pending' ? '⏳' : booking.paymentStatus === 'failed' ? '✕' : '✓'}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
          {booking.paymentStatus === 'pending' ? 'بانتظار إتمام الدفع' : booking.paymentStatus === 'failed' ? 'فشل عملية الدفع' : 'تم تأكيد حجزك بنجاح!'}
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>رقم الحجز: #{booking.bookingCode || booking.id}</p>

        <span className="badge" style={{ background: `${cfg.color}18`, color: cfg.color, padding: '0.4rem 1rem' }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
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
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>الإجمالي ({booking.seats.length} تذكرة × {pricePerSeatYER.toLocaleString()} ر.ي)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00f5d4' }}>
              {booking.totalPriceYER.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>ر.ي</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" style={{ padding: '0.6rem 1.1rem' }} onClick={() => window.print()}>
              <Printer size={16} /> طباعة التذكرة
            </button>
            {booking.paymentStatus === 'pending' && (
              <button className="btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
                <CreditCard size={16} /> الدفع الآن
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '1.5rem' }}>
        احتفظ برقم الحجز لعرضه عند الصعود إلى الحافلة. يمكنك أيضاً متابعة حالة الحجز من صفحة "حجوزاتي".
      </p>
    </div>
  );
};

export default BookingDetailsPage;
