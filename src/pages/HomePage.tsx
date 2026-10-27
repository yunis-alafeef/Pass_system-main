/**
 * HomePage.tsx — الصفحة الرئيسية (المهمة 4.3)
 * نموذج البحث يرسل الفلاتر إلى API الخلفية عبر React Query (useTrips)
 * مع حالات تحميل/خطأ، وشارة توضح مصدر البيانات (API مباشر / وضع تجريبي).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, ShieldCheck, Ticket, Compass, Sparkles, Filter, Wifi, WifiOff, AlertCircle, RotateCw } from 'lucide-react';
import { SearchForm } from '../components/SearchForm';
import { TripCard } from '../components/TripCard';
import { useTrips } from '../hooks/useAppData';
import { TripType } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{ origin: string; destination: string; date: string; tripType: TripType | 'all' }>({
    origin: '',
    destination: '',
    date: '',
    tripType: 'all',
  });

  const { data, isFetching, isError, refetch } = useTrips(filters);
  const trips = data?.trips ?? [];
  const source = data?.source ?? 'demo';

  const handleSearch = (f: { origin: string; destination: string; date: string; tripType: TripType | 'all' }) => {
    setFilters(f);
  };

  return (
    <div className="container">
      {/* Hero Welcome Banner */}
      <div style={{ textAlign: 'center', paddingTop: '2.5rem', paddingBottom: '1rem' }} className="animate-fade-in">
        <span className="badge badge-teal" style={{ marginBottom: '0.75rem', fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}>
          <Sparkles size={14} /> المنصة الرقمية الأولى لحجوزات النقل في اليمن
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', lineHeight: '1.2' }}>
          احجز تذكرتك بكل سهولة وأمان عبر <span style={{ background: 'linear-gradient(90deg, #3a86ff, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pass System</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
          ربط موحد ومباشر بين مكاتب النقل الداخلي بين المحافظات اليمنية والنقل الدولي بين اليمن والمملكة العربية السعودية.
        </p>
      </div>

      {/* Search Component */}
      <SearchForm onSearch={handleSearch} />

      {/* Trip Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass color="#3a86ff" /> الرحلات المتاحة ({isFetching ? '...' : trips.length})
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* مصدر البيانات: API حقي أو وضع تجريبي */}
          <span
            className="glass-card"
            title={source === 'api' ? 'البيانات قادمة مباشرة من الخلفية' : 'الخلفية غير متاحة — يتم العرض ببيانات تجريبية'}
            style={{
              padding: '0.35rem 0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              color: source === 'api' ? '#00f5d4' : '#ffbe0b',
            }}
          >
            {source === 'api' ? <Wifi size={14} /> : <WifiOff size={14} />}
            {source === 'api' ? 'متصل بالخلفية مباشرة' : 'وضع تجريبي (بدون خلفية)'}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={14} /> خيارات الترتيب: الأسعار والتوفر المباشر
          </span>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderColor: 'rgba(255,0,110,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ff006e' }}>
            <AlertCircle size={22} />
            <span style={{ fontWeight: 700 }}>تعذر جلب الرحلات من الخادم</span>
          </div>
          <button onClick={() => void refetch()} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <RotateCw size={16} /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* Trips List */}
      {trips.length > 0 ? (
        trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onSelectSeats={() => navigate(`/trip/${trip.id}/seats`)}
            onViewDetails={() => navigate(`/trip/${trip.id}`)}
          />
        ))
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <Bus size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>عذراً، لم يتم العثور على رحلات مطابقة</h3>
          <p>يرجى تغيير معايير البحث أو اختيار تاريخ آخر.</p>
        </div>
      )}

      {/* Quick links footer strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/my-tickets')} className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
          <Ticket size={18} /> حجوزاتي وتذاكري
        </button>
        <button onClick={() => navigate('/register')} className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
          <ShieldCheck size={18} /> إنشاء حساب جديد
        </button>
      </div>
    </div>
  );
};
