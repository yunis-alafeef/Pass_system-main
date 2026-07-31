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
  const [date, setDate] = useState('2026-07-28');

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
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginTop: '2rem', marginBottom: '2.5rem' }}>
      
      {/* Trip Type Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem', borderRadius: '12px' }}>
          <button
            type="button"
            className={`btn-secondary ${tripType === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setTripType('all')}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <Compass size={16} /> All الرحلات
          </button>
          <button
            type="button"
            className={`btn-secondary ${tripType === 'internal' ? 'btn-primary' : ''}`}
            onClick={() => setTripType('internal')}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <MapPin size={16} /> نقل داخلي بين المحافظات
          </button>
          <button
            type="button"
            className={`btn-secondary ${tripType === 'international' ? 'btn-primary' : ''}`}
            onClick={() => setTripType('international')}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <Globe size={16} /> نقل دولي (اليمن ↔ السعودية)
          </button>
        </div>

        <span className="badge badge-amber">
          ⚡ تحديث فوري للمقاعد والأسعار
        </span>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
        
        {/* Origin */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
            <MapPin size={16} color="#3a86ff" /> نقطة الانطلاق (المغادرة)
          </label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: 'Cairo',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          >
            <option value="">جميع المحافظات / المدن</option>
            {allDestinations.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
          <button
            type="button"
            onClick={handleSwap}
            className="btn-secondary"
            title="تبديل الوجهة"
            style={{ padding: '0.75rem', borderRadius: '50%', border: '1px solid rgba(58, 134, 255, 0.4)' }}
          >
            <ArrowRightLeft size={18} color="#3a86ff" />
          </button>
        </div>

        {/* Destination */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
            <MapPin size={16} color="#00f5d4" /> وجهة الوصول
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: 'Cairo',
              fontSize: '0.95rem',
              outline: 'none'
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
            <Calendar size={16} color="#ffbe0b" /> تاريخ السفر
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              backgroundColor: '#090d16',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: 'Cairo',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Submit */}
        <div>
          <button type="submit" className="btn-primary" style={{ width: '100%', height: '48px', fontSize: '1rem' }}>
            <Search size={20} /> ابحث عن الرحلات
          </button>
        </div>

      </form>
    </div>
  );
};
