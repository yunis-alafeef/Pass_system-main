import React, { useState } from 'react';
import { X, User, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Trip, Passenger, PaymentMethod, Booking } from '../types';
import { createBooking } from '../services/bookingService';

interface BookingFormModalProps {
  trip: Trip;
  /** معرّفات المقاعد في الخلفية (seat ids) — تُستخدم عند إنشاء الحجز */
  selectedSeatIds: string[];
  /** أرقام المقاعد للعرض (seat numbers) */
  selectedSeatNumbers: string[];
  onClose: () => void;
  onBookingComplete: (booking: Booking) => void;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  trip,
  selectedSeatIds,
  selectedSeatNumbers,
  onClose,
  onBookingComplete,
}) => {
  // Form state for each passenger
  const [passengers, setPassengers] = useState<Passenger[]>(
    selectedSeatNumbers.map((seat) => ({
      seatNumber: seat,
      fullName: '',
      identityNumber: '',
      phone: '',
      gender: 'male',
    }))
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('kureimi');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extra features for System 06 & 07 (Baggage, Special Needs, Currency)
  const [baggageCount, setBaggageCount] = useState(1);
  const [specialAssistance, setSpecialAssistance] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState<'YER' | 'SAR'>('YER');

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: ({ booking }) => {
      setErrorMessage(null);
      onBookingComplete(booking);
    },
    onError: (error: unknown) => {
      const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
      const rawMessage = response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(' - ')
        : rawMessage ?? 'تعذر إتمام الحجز. تحقق من اتصالك وأعد المحاولة.';
      setErrorMessage(message);
    },
  });

  const isSubmitting = createBookingMutation.isPending;

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  // Pricing calculations
  const extraBags = Math.max(0, baggageCount - 1);
  const baggageFeeYER = extraBags * 3000;
  const vipSeatCount = selectedSeatNumbers.filter((s) => Number(s) <= 8).length; // First 2 rows (1-8)
  const vipExtraYER = vipSeatCount * 3000;
  const basePriceYER = selectedSeatNumbers.length * trip.priceYER;
  const totalPriceYER = basePriceYER + vipExtraYER + baggageFeeYER;
  const totalPriceSAR = Math.round(totalPriceYER / (trip.priceYER ? trip.priceYER / trip.priceSAR : 400));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    createBookingMutation.mutate({
      trip,
      seats: selectedSeatIds,
      passengers,
      paymentMethod,
      totalPriceYER,
      totalPriceSAR,
      baggageCount,
      baggageExtraFeeYER: baggageFeeYER,
      specialAssistance,
    });
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
        maxWidth: '780px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        border: '1px solid rgba(0, 245, 212, 0.3)'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User color="#00f5d4" /> استكمال بيانات الحجز والدفع
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              المقاعد المختارة: ({selectedSeatNumbers.join(', ')}) • الرحلة: {trip.origin} ➔ {trip.destination}
            </span>
          </div>

          {/* Currency Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              onClick={() => setPreferredCurrency('YER')}
              style={{
                background: preferredCurrency === 'YER' ? '#00f5d4' : 'transparent',
                color: preferredCurrency === 'YER' ? '#0b1120' : '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ريال يمني (YER)
            </button>
            <button
              type="button"
              onClick={() => setPreferredCurrency('SAR')}
              style={{
                background: preferredCurrency === 'SAR' ? '#ffbe0b' : 'transparent',
                color: preferredCurrency === 'SAR' ? '#0b1120' : '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ريال سعودي (SAR)
            </button>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {errorMessage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(255, 82, 82, 0.12)',
              border: '1px solid rgba(255, 82, 82, 0.4)',
              color: '#ff8a8a', padding: '0.8rem 1rem', borderRadius: '12px',
              fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem'
            }}>
              <AlertTriangle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* Passenger Forms */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#00f5d4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={18} /> بيانات المسافرين (FR-BM-002)
            </h3>

            {passengers.map((p, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3a86ff', marginBottom: '0.75rem' }}>
                  👤 المسافر رقم {idx + 1} (مقعد رقم {p.seatNumber}) {Number(p.seatNumber) <= 8 && <span style={{ color: '#ffbe0b', fontSize: '0.75rem', marginRight: '0.5rem' }}>★ مقعد VIP</span>}
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

          {/* Additional Booking Services: Baggage & Special Assistance (FR-BM-001-04) */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#3a86ff', marginBottom: '1rem' }}>
              🧳 الخدمات الإضافية والأمتعة (Baggage & Assistance)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.3rem' }}>
                  عدد الحقائب المشحونة (حقيبة يد + أمتعة)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <select
                    value={baggageCount}
                    onChange={(e) => setBaggageCount(Number(e.target.value))}
                    style={{
                      padding: '0.6rem 0.9rem',
                      backgroundColor: '#090d16',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontFamily: 'Cairo',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value={1}>1 حقيبة (مشمولة مجاناً)</option>
                    <option value={2}>2 حقائب (+3,000 ر.ي)</option>
                    <option value={3}>3 حقائب (+6,000 ر.ي)</option>
                    <option value={4}>4 حقائب (+9,000 ر.ي)</option>
                  </select>
                  {baggageFeeYER > 0 && <span style={{ color: '#ffbe0b', fontSize: '0.8rem', fontWeight: 700 }}>+ {baggageFeeYER.toLocaleString()} ر.ي</span>}
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={specialAssistance}
                    onChange={(e) => setSpecialAssistance(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#00f5d4' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    طلب رعاية أو مساعدة خاصة (كرسي متحرك / مرافقة كبار السن)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffbe0b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={18} /> بوابة الدفع الإلكتروني المعتمدة (FR-PF-002)
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
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>بطاقة بنكية دولية</div>
              </div>

              <div
                onClick={() => setPaymentMethod('cash')}
                className="glass-card"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  border: paymentMethod === 'cash' ? '2px solid #00f5d4' : '1px solid rgba(255,255,255,0.08)',
                  background: paymentMethod === 'cash' ? 'rgba(0, 245, 212, 0.1)' : 'rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>💵 نقداً في مكتب النقل</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>الدفع عند المحطة</div>
              </div>

            </div>
          </div>

          {/* Pricing Summary & Submit */}
          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                المقاعد: {selectedSeatNumbers.length} • التكلفة الأساسية: {basePriceYER.toLocaleString()} ر.ي {vipExtraYER > 0 && `(+${vipExtraYER.toLocaleString()} VIP)`} {baggageFeeYER > 0 && `(+${baggageFeeYER.toLocaleString()} أمتعة)`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00f5d4' }}>
                  {preferredCurrency === 'YER' ? `${totalPriceYER.toLocaleString()} ر.ي` : `${totalPriceSAR.toLocaleString()} ر.س`}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffbe0b' }}>
                  {preferredCurrency === 'YER' ? `(يعادل ${totalPriceSAR} ر.س)` : `(يعادل ${totalPriceYER.toLocaleString()} ر.ي)`}
                </span>
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

