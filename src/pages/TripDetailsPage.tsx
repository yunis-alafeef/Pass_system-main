/**
 * TripDetailsPage.tsx — تفاصيل رحلة (/trip/:id) (المهمة 4.8)
 * يجلب الرحلة من الخلفية عبر useTrip ويعرض كامل تفاصيلها
 * مع زر الانتقال إلى مخطط المقاعد.
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bus, Clock, Star, Armchair, ShieldCheck, Check, ArrowLeft,
  AlertCircle, RotateCw, ArrowRight, MapPin, Globe,
} from 'lucide-react';
import { useTrip } from '../hooks/useAppData';

const TripDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useTrip(id);

  // حالة التحميل (Skeleton)
  if (isLoading) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <RotateCw size={36} color="#3a86ff" style={{ marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: '#fff', fontSize: '1.2rem' }}>جاري جلب تفاصيل الرحلة...</h2>
        </div>
      </div>
    );
  }

  const trip = data?.trip;

  // غير موجود
  if (!trip) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="#ff006e" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>الرحلة غير موجودة</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            قد يكون هذا المعرّف غير صحيح أو أن الرحلة أُلغيت من المكتب.
          </p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem' }}>
            <ArrowRight size={18} /> العودة للبحث عن رحلات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      {/* Breadcrumb */}
      <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        <ArrowRight size={16} /> رجوع إلى نتائج البحث
      </button>

      {/* Hero */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(58, 134, 255, 0.12) 0%, rgba(19, 27, 46, 0.85) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff' }}>{trip.vendorName}</h1>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#ffbe0b', fontWeight: 700 }}>
                <Star size={16} fill="#ffbe0b" /> {trip.vendorRating}
              </span>
            </div>
            <span className="badge badge-teal">
              {trip.tripType === 'international' ? <Globe size={12} /> : <MapPin size={12} />}
              {trip.tripType === 'international' ? 'رحلة دولية (اليمن ↔ السعودية)' : 'رحلة نقل داخلي'}
            </span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00f5d4' }}>
              {trip.priceYER.toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>ر.ي</span>
            </div>
            <div style={{ color: '#ffbe0b', fontWeight: 700 }}>أو {trip.priceSAR} ر.س</div>
          </div>
        </div>
      </div>

      {/* Route & Times */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>المغادرة من</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00f5d4' }}>{trip.origin}</div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} color="#94a3b8" /> {trip.departureTime}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#ffbe0b', fontWeight: 700, background: 'rgba(255,190,11,0.1)', padding: '0.25rem 0.7rem', borderRadius: '999px', marginBottom: '0.3rem' }}>
              {trip.duration}
            </div>
            <Bus size={26} color="#3a86ff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>الوصول إلى</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3a86ff' }}>{trip.destination}</div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
              <Clock size={14} color="#94a3b8" /> {trip.arrivalTime}
            </div>
          </div>
        </div>
      </div>

      {/* Bus & Seats info */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bus color="#3a86ff" /> تفاصيل الحافلة والمقاعد
        </h2>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <span className="badge badge-teal">نوع الحافلة: {trip.busType}</span>
          <span className="badge badge-amber">
            <Armchair size={14} /> متبقي {trip.availableSeats} من {trip.totalSeats} مقعد
          </span>
        </div>

        {trip.features.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {trip.features.map((feat, idx) => (
              <span key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.7rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={13} color="#00f5d4" /> {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          <ShieldCheck size={18} color="#00f5d4" />
          حجز آمن مع حجز مؤقت للمقعد مدته 15 دقيقة
        </div>
        <button
          onClick={() => navigate(`/trip/${trip.id}/seats`)}
          className="btn-primary"
          style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
        >
          <Armchair size={20} />
          <span>اختر مقعدك الآن</span>
          <ArrowLeft size={20} />
        </button>
      </div>
    </div>
  );
};

export default TripDetailsPage;
