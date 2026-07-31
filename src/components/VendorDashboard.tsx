import React, { useState } from 'react';
import { Bus, Plus, TrendingUp, Users, DollarSign, Award, CheckCircle, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { mockVendors, mockTrips } from '../data/mockData';
import { Trip } from '../types';

export const VendorDashboard: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [showAddModal, setShowAddModal] = useState(false);

  // New trip form state
  const [origin, setOrigin] = useState('صنعاء');
  const [destination, setDestination] = useState('عدن');
  const [departureTime, setDepartureTime] = useState('08:00 صباحاً');
  const [priceYER, setPriceYER] = useState(35000);
  const [priceSAR, setPriceSAR] = useState(90);

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      vendorId: 'v1',
      vendorName: 'شركة البراق للنقل الدولي والمحلي',
      vendorRating: 4.9,
      origin,
      destination,
      departureTime,
      arrivalTime: '04:00 مساءً',
      duration: '8 ساعات',
      priceYER: Number(priceYER),
      priceSAR: Number(priceSAR),
      availableSeats: 45,
      totalSeats: 45,
      busType: 'VIP الممتاز',
      tripType: destination.includes('السعودية') ? 'international' : 'internal',
      features: ['واي فاي مجاني', 'مكيف هواء', 'شاحن لكل مقعد']
    };

    setTrips([newTrip, ...trips]);
    setShowAddModal(false);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Dashboard Top Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(58, 134, 255, 0.15) 0%, rgba(19, 27, 46, 0.8) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                لوحة التحكم لمكتب النقل (Vendor Management System)
              </h1>
              <span className="badge badge-teal">
                <CheckCircle size={14} /> مكتب موثق ورسمي
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              مرحباً بكم، شركة البراق للنقل الدولي والمحلي • معرّف المكتب: VENDOR-7701
            </p>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <Plus size={20} /> إضافة رحلة جديدة
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            إجمالي الرحلات المسجلة
            <Bus size={20} color="#3a86ff" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '0.5rem' }}>
            {trips.length} رحلة
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>+12% مقارنة بالشهر السابق</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            إجمالي الحجوزات النشطة
            <Users size={20} color="#00f5d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '0.5rem' }}>
            1,420 راكب
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>نسبة إشغال المقاعد 88%</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            إجمالي الدخل (YER)
            <DollarSign size={20} color="#ffbe0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>
            49.7M <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ر.ي</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ffbe0b', marginTop: '0.3rem' }}>عمولة المنصة المقتطعة: 5%</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            تقييم المسافرين
            <Award size={20} color="#ff006e" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffbe0b', marginTop: '0.5rem' }}>
            4.9 / 5.0
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>مبني على 350 تقييم مؤكد</div>
        </div>

      </div>

      {/* Active Trips Table / Cards */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bus color="#3a86ff" /> جدول الرحلات النشطة للشركة
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '0.9rem' }}>رقم الرحلة</th>
                <th style={{ padding: '0.9rem' }}>خط السير (من ➔ إلى)</th>
                <th style={{ padding: '0.9rem' }}>نوع الحافلة</th>
                <th style={{ padding: '0.9rem' }}>وقت المغادرة</th>
                <th style={{ padding: '0.9rem' }}>المقاعد المتاحة</th>
                <th style={{ padding: '0.9rem' }}>سعر التذكرة</th>
                <th style={{ padding: '0.9rem' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.9rem', fontWeight: 700, color: '#3a86ff' }}>{trip.id.toUpperCase()}</td>
                  <td style={{ padding: '0.9rem', fontWeight: 700, color: '#fff' }}>
                    {trip.origin} ➔ {trip.destination}
                  </td>
                  <td style={{ padding: '0.9rem', color: '#cbd5e1' }}>{trip.busType}</td>
                  <td style={{ padding: '0.9rem', color: '#94a3b8' }}>{trip.departureTime}</td>
                  <td style={{ padding: '0.9rem' }}>
                    <span className="badge badge-amber">{trip.availableSeats} / {trip.totalSeats} مقعد</span>
                  </td>
                  <td style={{ padding: '0.9rem', color: '#00f5d4', fontWeight: 800 }}>
                    {trip.priceYER.toLocaleString()} ر.ي ({trip.priceSAR} ر.س)
                  </td>
                  <td style={{ padding: '0.9rem' }}>
                    <span className="badge badge-teal">جاهزة للتشغيل</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding a new trip */}
      {showAddModal && (
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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '550px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>إضافة رحلة جديدة للجدول</h2>
            
            <form onSubmit={handleAddTrip} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>نقطة الانطلاق (المغادرة)</label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>وجهة الوصول</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>وقت الانطلاق</label>
                  <input
                    type="text"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>السعر (ريال يمني)</label>
                  <input
                    type="number"
                    required
                    value={priceYER}
                    onChange={(e) => setPriceYER(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">إلغاء</button>
                <button type="submit" className="btn-primary">حفظ ونشر الرحلة</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
