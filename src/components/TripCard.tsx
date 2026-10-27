import React from 'react';
import { Bus, Clock, Star, Armchair, Check } from 'lucide-react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onSelectSeats: (trip: Trip) => void;
  onViewDetails?: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onSelectSeats, onViewDetails }) => {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Top Bar: Vendor & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(58, 134, 255, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#3a86ff' }}>
            <Bus size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{trip.vendorName}</h3>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem', color: '#ffbe0b', fontWeight: 700 }}>
                <Star size={14} fill="#ffbe0b" /> {trip.vendorRating}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              حافلة {trip.busType} • {trip.tripType === 'international' ? 'رحلة دولية مرخصة' : 'رحلة نقل داخلي'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={trip.tripType === 'international' ? 'badge badge-purple' : 'badge badge-teal'}>
            {trip.tripType === 'international' ? '🌐 دولي (يمن - سعودية)' : '🚌 داخلي'}
          </span>
          <span className="badge badge-amber">
            <Armchair size={14} /> متبقي {trip.availableSeats} مقعد
          </span>
        </div>
      </div>

      {/* Main Trip Info: Origin -> Arrow -> Destination */}
      <div className="trip-route-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.9rem 1.1rem', borderRadius: '14px' }}>

        {/* Origin */}
        <div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>المغادرة</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#00f5d4' }}>{trip.origin}</div>
          <div style={{ fontSize: '0.82rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
            <Clock size={13} color="#94a3b8" /> {trip.departureTime}
          </div>
        </div>

        {/* Duration / Arrow */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: '#ffbe0b', fontWeight: 600, background: 'rgba(255,190,11,0.1)', padding: '0.15rem 0.55rem', borderRadius: '999px', display: 'inline-block', marginBottom: '0.25rem' }}>
            {trip.duration}
          </div>
          <div style={{ height: '2px', width: '70px', background: 'linear-gradient(90deg, #00f5d4, #3a86ff)', margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-4px', right: '30px', width: '10px', height: '10px', borderRadius: '50%', background: '#3a86ff' }}></div>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.25rem' }}>مباشر دون توقف</div>
        </div>

        {/* Destination */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>الوصول المتوقع</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3a86ff' }}>{trip.destination}</div>
          <div style={{ fontSize: '0.82rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem', justifyContent: 'flex-end' }}>
            <Clock size={13} color="#94a3b8" /> {trip.arrivalTime}
          </div>
        </div>

      </div>

      {/* Features & Prices */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', paddingTop: '0.5rem' }}>

        {/* Features list */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {trip.features.slice(0, 4).map((feat, idx) => (
            <span key={idx} style={{ fontSize: '0.72rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Check size={12} color="#00f5d4" /> {feat}
            </span>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flexWrap: 'wrap', width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00f5d4' }}>
              {trip.priceYER.toLocaleString()} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94a3b8' }}>ر.ي</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#ffbe0b', fontWeight: 700 }}>
              أو {trip.priceSAR} <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>ر.س</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onViewDetails && (
              <button onClick={() => onViewDetails(trip)} className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                التفاصيل
              </button>
            )}
            <button
              onClick={() => onSelectSeats(trip)}
              className="btn-primary"
              style={{ padding: '0.6rem 1.15rem', fontSize: '0.88rem' }}
            >
              <Armchair size={16} />
              <span>اختر المقاعد</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
