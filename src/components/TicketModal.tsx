import React from 'react';
import { X, Ticket, QrCode, Printer, CheckCircle, Bus, MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { Booking } from '../types';

interface TicketModalProps {
  booking: Booking;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(5, 8, 15, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2.5rem',
        border: '2px solid rgba(0, 245, 212, 0.4)',
        background: 'linear-gradient(180deg, #131b2e 0%, #090d16 100%)'
      }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-teal" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              <CheckCircle size={16} /> حجز مؤكد ومدفوع
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              كود التذكرة: <strong style={{ color: '#fff' }}>{booking.bookingCode}</strong>
            </span>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Digital Ticket Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Decorative stamp */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(0, 245, 212, 0.05)',
            border: '2px dashed rgba(0, 245, 212, 0.2)',
            pointerEvents: 'none'
          }} />

          {/* Ticket Branding Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed rgba(255,255,255,0.1)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#00f5d4', fontWeight: 700, letterSpacing: '1px' }}>
                PASS SYSTEM OFFICIAL E-TICKET
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                {booking.trip.vendorName}
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>
                حافلة {booking.trip.busType}
              </span>
            </div>
          </div>

          {/* Route Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '14px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>من (نقطة المغادرة)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00f5d4' }}>{booking.trip.origin}</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>{booking.trip.departureTime}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Bus size={22} color="#3a86ff" />
              <div style={{ fontSize: '0.7rem', color: '#ffbe0b', marginTop: '0.2rem' }}>{booking.trip.duration}</div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>إلى (نقطة الوصول)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3a86ff' }}>{booking.trip.destination}</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>{booking.trip.arrivalTime}</div>
            </div>
          </div>

          {/* Seats & Passenger details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>المقاعد المحجوزة</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffbe0b' }}>
                رقم ({booking.seats.join(', ')})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>تاريخ السفر والحجز</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                {booking.bookingDate}
              </div>
            </div>
          </div>

          {/* Passengers List */}
          <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>أسماء المسافرين المسجلين:</div>
            {booking.passengers.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#e2e8f0', padding: '0.25rem 0', borderBottom: i < booking.passengers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span>• {p.fullName} (مقعد {p.seatNumber})</span>
                <span style={{ color: '#94a3b8' }}>هوية/جواز: {p.identityNumber}</span>
              </div>
            ))}
          </div>

          {/* QR Code & Barcode Section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px dashed rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '10px' }}>
                <QrCode size={64} color="#090d16" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>مسح التذكرة عند الصعود</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00f5d4' }}>{booking.bookingCode}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>حالة الدفع: مدفوع مؤكد ({booking.paymentMethod.toUpperCase()})</div>
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>المبلغ الإجمالي</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00f5d4' }}>
                {booking.totalPriceYER.toLocaleString()} ر.ي
              </div>
              <div style={{ fontSize: '0.85rem', color: '#ffbe0b', fontWeight: 700 }}>
                {booking.totalPriceSAR} ر.س
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ gap: '0.5rem' }}>
            <Printer size={18} /> طباعة أو حفظ PDF
          </button>
          <button onClick={onClose} className="btn-primary">
            تم - إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
