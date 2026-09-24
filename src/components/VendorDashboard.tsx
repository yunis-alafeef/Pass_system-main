/**
 * VendorDashboard.tsx — لوحة المزودين (المهمة 4.6)
 * ✅ مربوطة بالخلفية: البيانات تُجلب عبر React Query (useVendorTrips/useVendorStats)
 * وإنشاء رحلة جديدة يرسل POST /trips حقيقية (useCreateVendorTrip)
 *
 * === درس تعليمي: نمط "المكون الذكي" (Smart/Container Component) ===
 * 1. المكون لا يحتفظ بنسخة من البيانات في useState — بل يقرأها من كاش React Query.
 *    (النسخ المحلية تتسبب ببيانات قديمة (stale data) وتضارب بين المستخدمين)
 * 2. كل حالة تحميل/خطأ/فراغ لها واجهة مستقلة (Loading / Error / Empty states).
 * 3. الـ Mutations (الكتابة على الخادم) لا تعدّل الكاش يدوياً — بل تُبطل الكاش (invalidate)
 *    وReact Query يعيد الجلب تلقائياً. هذا يضمن أن الجدول يعرض بيانات الخادم دائماً.
 */

import React, { useState } from 'react';
import { Bus, Plus, Users, DollarSign, Award, CheckCircle, AlertCircle, RotateCw, Wifi, WifiOff } from 'lucide-react';
import { useVendorTrips, useVendorStats, useCreateVendorTrip } from '../hooks/useAppData';
import { getApiErrorMessage } from '../api';

export const VendorDashboard: React.FC = () => {
  // ---- البيانات تأتي من الخادم (أو الوضع التجريبي) عبر React Query ----
  const { data: tripsData, isLoading: tripsLoading, isError: tripsError, refetch: refetchTrips } = useVendorTrips();
  const { data: statsData } = useVendorStats();
  const trips = tripsData?.trips ?? [];
  const stats = statsData?.stats;
  const source = tripsData?.source ?? 'demo';

  // ---- الـ Mutation: إرسال "إضافة رحلة" إلى POST /trips ----
  // بعد النجاح يُبطل كاش رحلات المزود فتُعاد قراءته من الخادم تلقائياً
  const createTripMutation = useCreateVendorTrip();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // حقول نموذج إضافة رحلة (حالة إدخال محلية فقط — لا تُحفظ فيها بيانات العرض)
  const [origin, setOrigin] = useState('صنعاء');
  const [destination, setDestination] = useState('عدن');
  const [departureTime, setDepartureTime] = useState(() => new Date(Date.now() + 24 * 3600_000).toISOString().slice(0, 16));
  const [priceYER, setPriceYER] = useState(35000);
  const [priceSAR, setPriceSAR] = useState(90);

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    createTripMutation.mutate(
      {
        origin,
        destination,
        // الخلفية تتوقع ISO datetime — نحوّل من حقل datetime-local (مثل "2026-08-02T08:00")
        departureTime: new Date(departureTime).toISOString(),
        priceYER: Number(priceYER),
        priceSAR: Number(priceSAR),
      },
      {
        onSuccess: () => {
          // نجاح → نغلق النافذة ونعيد الحقول للقيم الافتراضية
          // (لا نلمس قائمة الرحلات — invalidateQueries في الـ hook أعاد جلبها من الخادم)
          setShowAddModal(false);
          setOrigin('صنعاء');
          setDestination('عدن');
          setPriceYER(35000);
          setPriceSAR(90);
        },
        onError: (err) => {
          // خطأ صريح من الخلفية (مثلاً: ليست لديك صلاحية مزود)
          setFormError(getApiErrorMessage(err));
        },
      }
    );
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
              {/* شارة مصدر البيانات: من الخلفية مباشرة أم وضع تجريبي */}
              <span
                className="glass-card"
                title={source === 'api' ? 'البيانات قادمة مباشرة من الخلفية' : 'الخلفية غير متاحة — يتم العرض ببيانات تجريبية'}
                style={{ padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: source === 'api' ? '#00f5d4' : '#ffbe0b' }}
              >
                {source === 'api' ? <Wifi size={14} /> : <WifiOff size={14} />}
                {source === 'api' ? 'متصل بالخلفية' : 'وضع تجريبي'}
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

      {/* KPI Stats Cards — أرقام حقيقية من الخادم عبر useVendorStats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            إجمالي الرحلات المسجلة
            <Bus size={20} color="#3a86ff" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '0.5rem' }}>
            {tripsLoading ? '...' : trips.length} رحلة
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>محدّثة من الخادم مباشرة</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            إجمالي الحجوزات النشطة
            <Users size={20} color="#00f5d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '0.5rem' }}>
            {stats ? stats.totalBookings.toLocaleString() : '—'} راكب
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>نسبة إشغال المقاعد {stats ? stats.occupancyRate : 0}%</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            إجمالي الدخل (YER)
            <DollarSign size={20} color="#ffbe0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>
            {stats ? `${(stats.totalRevenueYER / 1_000_000).toFixed(1)}M` : '—'} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ر.ي</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ffbe0b', marginTop: '0.3rem' }}>عمولة المنصة المقتطعة: 5%</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            تقييم المسافرين
            <Award size={20} color="#ff006e" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffbe0b', marginTop: '0.5rem' }}>
            {stats ? stats.rating.toFixed(1) : '—'} / 5.0
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>مبني على التقييمات المؤكدة</div>
        </div>

      </div>

      {/* حالة خطأ جلب الرحلات */}
      {tripsError && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderColor: 'rgba(255,0,110,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ff006e' }}>
            <AlertCircle size={22} />
            <span style={{ fontWeight: 700 }}>تعذر جلب رحلات المكتب من الخادم</span>
          </div>
          <button onClick={() => void refetchTrips()} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <RotateCw size={16} /> إعادة المحاولة
          </button>
        </div>
      )}

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
              {tripsLoading ? (
                // حالة التحميل — skeleton صف بسيط بدلاً من شاشة فارغة
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    <RotateCw size={20} style={{ animation: 'spin 1.2s linear infinite' }} /> جارٍ جلب الرحلات من الخادم...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                // حالة الفراغ — لا رحلات بعد (مهم جداً في الوضع الحقيقي لأن المزود الجديد لا يملك رحلات)
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Bus size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.3rem' }}>لا توجد رحلات مسجلة بعد</div>
                    <div>انقر "إضافة رحلة جديدة" لنشر أول رحلة لشركتك.</div>
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
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
                ))
              )}
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

            {/* رسالة خطأ من الخلفية (مثلاً: صلاحيات، بيانات ناقصة) */}
            {formError && (
              <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

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
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>وقت الانطلاق (التاريخ والوقت)</label>
                  {/* datetime-local يعطينا قيمة قابلة للتحويل لـ ISO ترسل للخلفية مباشرة */}
                  <input
                    type="datetime-local"
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
                {/* الزر يتعطل أثناء الإرسال لمنع إنشاء الرحلة مرتين بالخطأ (double submit) */}
                <button type="submit" className="btn-primary" disabled={createTripMutation.isPending}>
                  {createTripMutation.isPending ? 'جارٍ النشر...' : 'حفظ ونشر الرحلة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
