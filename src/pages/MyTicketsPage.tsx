import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { useMyBookings } from '../hooks/useAppData';
import { getApiErrorMessage } from '../api';

/** عرض حجوزات المستخدم من الخلفية، أو من التخزين المحلي في الوضع التجريبي. */
export const MyTicketsPage: React.FC = () => {
  const { data, isPending, isError, error, refetch } = useMyBookings();
  const bookings = data?.bookings ?? [];

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2.5rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Ticket color="#00f5d4" /> سِجِل حجوزاتي وتذاكري الرقمية
      </h1>

      {isPending ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>جاري تحميل حجوزاتك...</div>
      ) : isError ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#ff8a8a' }}>
          <p>{getApiErrorMessage(error)}</p>
          <button onClick={() => void refetch()} className="btn-secondary" style={{ marginTop: '1rem' }}>إعادة المحاولة</button>
        </div>
      ) : bookings.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-teal">{booking.paymentStatus === 'paid' ? 'تذكرة مؤكدة' : 'بانتظار الدفع'}</span>
                <span style={{ fontSize: '0.85rem', color: '#ffbe0b', fontWeight: 700 }}>{booking.bookingCode}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{booking.trip.vendorName}</h3>
              <div style={{ fontSize: '0.9rem', color: '#00f5d4', margin: '0.4rem 0', fontWeight: 700 }}>
                {booking.trip.origin} ➔ {booking.trip.destination}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                المقاعد: ({booking.seats.join(', ')}) • التاريخ: {booking.bookingDate}
              </div>
              <Link to={`/booking/${booking.id}`} className="btn-primary" style={{ width: '100%', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                استعراض وطباعة التذكرة
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <Ticket size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>لا توجد حجوزات سابقة حتى الآن</h3>
          <p>قم بالبحث عن رحلة واختيار المقاعد لإصدار تذكرتك الأولى.</p>
        </div>
      )}
    </div>
  );
};
