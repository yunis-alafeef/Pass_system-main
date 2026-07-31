import React, { useState } from 'react';
import { X, Armchair, ShieldCheck, UserCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Trip, Seat, SeatStatus } from '../types';

interface SeatMapModalProps {
  trip: Trip;
  onClose: () => void;
  onProceedToBooking: (selectedSeats: string[], isWomenOnly: boolean) => void;
}

export const SeatMapModal: React.FC<SeatMapModalProps> = ({ trip, onClose, onProceedToBooking }) => {
  // Generate 40-44 bus seats layout (4 seats per row: 2 left, Aisle, 2 right)
  const totalRows = 10;
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const bookedSeatNumbers = ['3', '4', '11', '12', '19', '20', '27', '28', '35'];
    const womenSeatNumbers = ['7', '8', '15', '16'];

    for (let r = 1; r <= totalRows; r++) {
      for (let c = 1; c <= 4; c++) {
        const seatNum = `${(r - 1) * 4 + c}`;
        let status: SeatStatus = 'available';

        if (bookedSeatNumbers.includes(seatNum)) status = 'booked';
        else if (womenSeatNumbers.includes(seatNum)) status = 'women';

        seats.push({
          id: `seat-${seatNum}`,
          seatNumber: seatNum,
          status,
          row: r,
          col: c,
          isVip: r <= 2 // First 2 rows are VIP
        });
      }
    }
    return seats;
  };

  const [seats, setSeats] = useState<Seat[]>(generateSeats());
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [isWomenSection, setIsWomenSection] = useState(false);

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status === 'booked') return;

    if (selectedSeatNumbers.includes(seat.seatNumber)) {
      setSelectedSeatNumbers(selectedSeatNumbers.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeatNumbers([...selectedSeatNumbers, seat.seatNumber]);
    }
  };

  const totalPriceYER = selectedSeatNumbers.length * trip.priceYER;
  const totalPriceSAR = selectedSeatNumbers.length * trip.priceSAR;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        border: '1px solid rgba(58, 134, 255, 0.3)'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Armchair color="#3a86ff" /> مخطط المقاعد الذكي - {trip.vendorName}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              الرحلة: {trip.origin} ➔ {trip.destination} ({trip.departureTime})
            </span>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Legend / Key */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div className="bus-seat women" style={{ width: '24px', height: '24px', borderRadius: '6px' }}></div>
            <span>مخصص عوائل/نساء</span>
          </div>
        </div>

        {/* Bus Layout Container */}
        <div style={{ background: '#0b1120', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
          
          {/* Driver & Front Door Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
              🚪 الباب الأمامي
            </div>
            <div style={{ background: 'rgba(58, 134, 255, 0.2)', color: '#3a86ff', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🚍 مقعد السائق
            </div>
          </div>

          {/* Seat Rows Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.from({ length: totalRows }).map((_, rIdx) => {
              const rowNum = rIdx + 1;
              const rowSeats = seats.filter(s => s.row === rowNum);
              const leftSeats = rowSeats.filter(s => s.col <= 2);
              const rightSeats = rowSeats.filter(s => s.col > 2);

              return (
                <div key={rowNum} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                  {/* Left 2 seats */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {leftSeats.map(seat => {
                      const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
                      return (
                        <div
                          key={seat.id}
                          className={`bus-seat ${seat.status} ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSeatSelection(seat)}
                        >
                          <span>{seat.seatNumber}</span>
                          {seat.isVip && <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>VIP</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                    ممر {rowNum}
                  </div>

                  {/* Right 2 seats */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {rightSeats.map(seat => {
                      const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
                      return (
                        <div
                          key={seat.id}
                          className={`bus-seat ${seat.status} ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSeatSelection(seat)}
                        >
                          <span>{seat.seatNumber}</span>
                          {seat.isVip && <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>VIP</span>}
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Back Door / WC */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>🚪 الباب الخلفي</span>
            <span>🚽 دورة مياه الحافلة</span>
          </div>

        </div>

        {/* Options & Summary */}
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
            disabled={selectedSeatNumbers.length === 0}
            onClick={() => onProceedToBooking(selectedSeatNumbers, isWomenSection)}
            className="btn-primary"
            style={{
              opacity: selectedSeatNumbers.length === 0 ? 0.5 : 1,
              cursor: selectedSeatNumbers.length === 0 ? 'not-allowed' : 'pointer',
              padding: '0.85rem 1.75rem',
              fontSize: '1rem'
            }}
          >
            <span>متابعة إدخال بيانات المسافرين</span>
            <ArrowLeft size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};
