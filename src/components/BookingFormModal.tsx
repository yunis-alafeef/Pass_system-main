import React, { useState } from 'react';
import { X, User, Phone, CreditCard, ShieldCheck, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { Trip, Passenger, PaymentMethod, Booking } from '../types';

interface BookingFormModalProps {
  trip: Trip;
  selectedSeats: string[];
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  trip,
  selectedSeats,
  onClose,
  onBookingComplete,
}) => {
  // Form state for each passenger
  const [passengers, setPassengers] = useState<Passenger[]>(
    selectedSeats.map((seat) => ({
      seatNumber: seat,
      fullName: '',
      identityNumber: '',
      phone: '',
      gender: 'male',
    }))
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('kureimi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const totalPriceYER = selectedSeats.length * trip.priceYER;
  const totalPriceSAR = selectedSeats.length * trip.priceSAR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking: Booking = {
        id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        bookingCode: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
        trip,
        seats: selectedSeats,
        passengers,
        totalPriceYER,
        totalPriceSAR,
        paymentMethod,
        paymentStatus: 'paid',
        bookingDate: new Date().toLocaleDateString('ar-YE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      setIsSubmitting(false);
      onBookingComplete(newBooking);
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(5, 8, 15, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User color="#00f5d4" /> استكمال بيانات الحجز والدفع
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              الشركة: {trip.vendorName} | المقاعد المختارة: ({selectedSeats.join(', ')})
            </span>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Passenger Forms */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#00f5d4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={18} /> بيانات المسافرين
            </h3>

            {passengers.map((p, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3a86ff', marginBottom: '0.75rem' }}>
                  👤 المسافر رقم {idx + 1} (مقعد رقم {p.seatNumber})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>الاسم الرباعي الكامل</label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسم المسافر..."
                      value={p.fullName}
                      onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontFamily: 'Cairo',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                      {trip.tripType === 'international' ? 'رقم جواز السفر (إجباري للدولي)' : 'رقم الهوية الوطنية / الشخصية'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={trip.tripType === 'international' ? 'A12345678' : '0101000000'}
                      value={p.identityNumber}
                      onChange={(e) => handlePassengerChange(idx, 'identityNumber', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontFamily: 'Cairo',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>رقم الهاتف (للتواصل والإشعار)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+967 770 000 000"
                      value={p.phone}
                      onChange={(e) => handlePassengerChange(idx, 'phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        backgroundColor: '#090d16',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontFamily: 'Cairo',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffbe0b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={18} /> بوابة الدفع الإلكتروني (آمن ومؤتمت)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              
              <div
                onClick={() => setPaymentMethod('kureimi')}
                className="glass-card"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: paymentMethod === 'kureimi' ? '2px solid #00f5d4' : '1px solid rgba(255,255,255,0.08)',
                  background: paymentMethod === 'kureimi' ? 'rgba(0, 245, 212, 0.1)' : 'rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>🏦 بنك الكريمي</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>حاسب مجاني / ام فلوس</div>
              </div>

              <div
                onClick={() => setPaymentMethod('tadamon')}
                className="glass-card"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: paymentMethod === 'tadamon' ? '2px solid #00f5d4' : '1px solid rgba(255,255,255,0.08)',
                  background: paymentMethod === 'tadamon' ? 'rgba(0, 245, 212, 0.1)' : 'rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>🏦 بنك التضامن</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>محفظة محفظتي / تحويل</div>
              </div>

              <div
                onClick={() => setPaymentMethod('jawwal')}
                className="glass-card"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: paymentMethod === 'jawwal' ? '2px solid #00f5d4' : '1px solid rgba(255,255,255,0.08)',
                  background: paymentMethod === 'jawwal' ? 'rgba(0, 245, 212, 0.1)' : 'rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>📱 محفظة جوال pay</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>دفع فوري سريع</div>
              </div>

              <div
                onClick={() => setPaymentMethod('visa')}
                className="glass-card"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: paymentMethod === 'visa' ? '2px solid #00f5d4' : '1px solid rgba(255,255,255,0.08)',
                  background: paymentMethod === 'visa' ? 'rgba(0, 245, 212, 0.1)' : 'rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>💳 Visa / MasterCard</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>بطاقة ائتمان دولية</div>
              </div>

            </div>
          </div>

          {/* Pricing Summary & Submit */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>إجمالي المبلغ المطلوب للدفع</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00f5d4' }}>{totalPriceYER.toLocaleString()} ر.ي</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffbe0b' }}>({totalPriceSAR} ر.س)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              {isSubmitting ? (
                <>جاري المعالجة والتأكيد...</>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>تأكيد الحجز وإصدار التذكرة</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
