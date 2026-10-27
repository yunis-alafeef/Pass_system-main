import React, { useState } from 'react';
import { Search, MapPin, Calendar, Globe, Compass, ArrowRightLeft } from 'lucide-react';
import { yemeniCities, internationalCities } from '../data/mockData';
import { TripType } from '../types';

interface SearchFormProps {
  onSearch: (filters: { origin: string; destination: string; date: string; tripType: TripType | 'all' }) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [tripType, setTripType] = useState<TripType | 'all'>('all');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const allDestinations = [...yemeniCities, ...internationalCities];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ origin, destination, date, tripType });
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem' }}>

      {/* Trip Type Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '620px' }}>
          <button
            type="button"
            className={`btn-secondary ${tripType === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setTripType('all')}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', flex: '1 1 auto', minWidth: '100px' }}
          >
            <Compass size={15} /> جميع الرحلات
          </button>
          <button
            type="button"
            className={`btn-secondary ${tripType === 'internal' ? 'btn-primary' : ''}`}
            onClick={() => setTripType('internal')}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', flex: '1 1 auto', minWidth: '140px' }}
          >
            <MapPin size={15} /> نقل داخلي
          </button>
          <button
            type="button"
            className={`btn-secondary ${tripType === 'international' ? 'btn-primary' : ''}`}
            onClick={() => setTripType('international')}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', flex: '1 1 auto', minWidth: '160px' }}
          >
            <Globe size={15} /> دولي (اليمن ↔ السعودية)
          </button>
        </div>

        <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
          ⚡ توفر فوري ومقاعد لحظية
        </span>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>

        {/* Origin */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
            <MapPin size={15} color="#3a86ff" /> نقطة الانطلاق
          </label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: 'Cairo',
              fontSize: '0.9rem',
              outline: 'none',
              minHeight: '44px'
            }}
          >
            <option value="">جميع المحافظات / المدن</option>
            {allDestinations.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Destination with swap button */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
              <MapPin size={15} color="#00f5d4" /> وجهة الوصول
            </label>
            <button
              type="button"
              onClick={handleSwap}
              style={{
                background: 'rgba(58, 134, 255, 0.1)',
                border: '1px solid rgba(58, 134, 255, 0.3)',
                borderRadius: '6px',
                padding: '0.15rem 0.45rem',
                fontSize: '0.7rem',
                color: '#3a86ff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontFamily: 'Cairo'
              }}
              title="تبديل نقطة الانطلاق والوصول"
            >
              <ArrowRightLeft size={12} /> تبديل
            </button>
          </div>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: 'Cairo',
              fontSize: '0.9rem',
              outline: 'none',
              minHeight: '44px'
            }}
          >
            <option value="">جميع الوجهات المتاحة</option>
            {allDestinations.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
            <Calendar size={15} color="#ffbe0b" /> تاريخ السفر
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: 'Cairo',
              fontSize: '0.9rem',
              outline: 'none',
              minHeight: '44px'
            }}
          />
        </div>

        {/* Search CTA */}
        <div>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: '44px', fontSize: '0.95rem' }}>
            <Search size={18} /> بحث عن الرحلات
          </button>
        </div>

      </form>
    </div>
  );
};
