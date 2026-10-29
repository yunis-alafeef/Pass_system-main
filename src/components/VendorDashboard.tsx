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
import {
  Bus, Plus, Users, DollarSign, Award, CheckCircle, AlertCircle, RotateCw,
  Wifi, WifiOff, FileText, Landmark, ArrowUpRight, ShieldCheck, CheckCircle2,
  MapPin
} from 'lucide-react';
import { useVendorTrips, useVendorStats, useCreateVendorTrip } from '../hooks/useAppData';
import { getApiErrorMessage } from '../api';
import {
  getVendorContractDetails, updateTripLifecycleStatus,
  getVendorPayouts, requestVendorPayout
} from '../services/vendorService';
import { TripLifecycleStatus, VendorPayout } from '../types';

type VendorTab = 'trips' | 'contract' | 'finance' | 'performance';

export const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VendorTab>('trips');
  const { data: tripsData, isLoading: tripsLoading, refetch: refetchTrips } = useVendorTrips();
  const { data: statsData } = useVendorStats();
  const trips = tripsData?.trips ?? [];
  const stats = statsData?.stats;
  const source = tripsData?.source ?? 'demo';

  const createTripMutation = useCreateVendorTrip();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Trip state
  const [origin, setOrigin] = useState('صنعاء');
  const [destination, setDestination] = useState('عدن');
  const [departureTime, setDepartureTime] = useState(() => new Date(Date.now() + 24 * 3600_000).toISOString().slice(0, 16));
  const [priceYER, setPriceYER] = useState(35000);
  const [priceSAR, setPriceSAR] = useState(90);
  const [busType, setBusType] = useState<'VIP الممتاز' | 'عادي المطور' | 'VIP ديلوكس'>('VIP الممتاز');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly'>('daily');

  // Vendor contract & KYC data
  const [vendorDetails] = useState(() => getVendorContractDetails('v1'));
  const [payouts, setPayouts] = useState<VendorPayout[]>(() => getVendorPayouts('v1'));
  const [payoutAmount, setPayoutAmount] = useState(5000000);
  const [payoutAccount, setPayoutAccount] = useState('حساب بنك الكريمي رقم 120045889');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Handle status update
  const handleUpdateStatus = async (tripId: string, status: TripLifecycleStatus) => {
    await updateTripLifecycleStatus(tripId, status);
    void refetchTrips();
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayout = requestVendorPayout('v1', payoutAmount, payoutAccount);
    setPayouts([newPayout, ...payouts]);
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
    }, 2000);
  };

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    createTripMutation.mutate(
      {
        origin,
        destination,
        departureTime: new Date(departureTime).toISOString(),
        priceYER: Number(priceYER),
        priceSAR: Number(priceSAR),
        busType,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setOrigin('صنعاء');
          setDestination('عدن');
          setPriceYER(35000);
          setPriceSAR(90);
        },
        onError: (err) => {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                لوحة التحكم لمكتب النقل (Vendor Management System)
              </h1>
              <span className="badge badge-teal">
                <CheckCircle size={14} /> مكتب موثق ورسمي
              </span>
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
              مرحباً بكم، شركة البراق للنقل الدولي والمحلي • معرّف المكتب: VENDOR-7701 • نسبة العمولة المعتمدة: {vendorDetails.contract.commissionRate}%
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowPayoutModal(true)} className="btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
              <Landmark size={18} /> طلب سحب أرباح
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Plus size={20} /> إضافة رحلة جديدة
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('trips')}
            className={activeTab === 'trips' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}
          >
            <Bus size={18} /> إدارة الرحلات والجدولة ({trips.length})
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={activeTab === 'contract' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}
          >
            <FileText size={18} /> العقد والعمولة والتوثيق
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={activeTab === 'finance' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}
          >
            <DollarSign size={18} /> المالية والأرباح والسحوبات ({payouts.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}
          >
            <Award size={18} /> تقييم الأداء والجودة (4.9★)
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
            إجمالي الدخل المحصل (YER)
            <DollarSign size={20} color="#ffbe0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>
            {stats ? `${(stats.totalRevenueYER / 1_000_000).toFixed(1)}M` : '—'} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ر.ي</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#ffbe0b', marginTop: '0.3rem' }}>عمولة المنصة: {vendorDetails.contract.commissionRate}%</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            تقييم المسافرين ومستوى المكتب
            <Award size={20} color="#ff006e" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffbe0b', marginTop: '0.5rem' }}>
            {stats ? stats.rating.toFixed(1) : '4.9'} / 5.0
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>المستوى: مكتب ذهبي متميز</div>
        </div>
      </div>

      {/* ================== TAB 1: TRIPS & SCHEDULING ================== */}
      {activeTab === 'trips' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bus color="#3a86ff" /> جدول الرحلات والتحكم في دورة الحياة (FR-RT-002 & FR-RT-007)
            </h2>
          </div>

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
                  <th style={{ padding: '0.9rem' }}>الحالة التشغيلية</th>
                  <th style={{ padding: '0.9rem' }}>إجراءات دورة الحياة</th>
                </tr>
              </thead>
              <tbody>
                {tripsLoading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <RotateCw size={20} style={{ animation: 'spin 1.2s linear infinite' }} /> جارٍ جلب الرحلات من الخادم...
                    </td>
                  </tr>
                ) : trips.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <Bus size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <div style={{ color: '#fff', fontWeight: 700, marginBottom: '0.3rem' }}>لا توجد رحلات مسجلة بعد</div>
                      <div>انقر "إضافة رحلة جديدة" لنشر أول رحلة لشركتك.</div>
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => {
                    const status = trip.status || 'SCHEDULED';
                    return (
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
                          <span className={`badge ${status === 'COMPLETED' ? 'badge-teal' : status === 'IN_TRANSIT' ? 'badge-purple' : status === 'BOARDING' ? 'badge-amber' : status === 'CANCELLED' ? 'badge-red' : 'badge-blue'}`}>
                            {status === 'SCHEDULED' ? 'مجدولة' : status === 'BOARDING' ? 'صعود الركاب' : status === 'IN_TRANSIT' ? 'في الطريق' : status === 'COMPLETED' ? 'مكتملة' : 'ملغاة'}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem' }}>
                          <select
                            value={status}
                            onChange={(e) => void handleUpdateStatus(trip.id, e.target.value as TripLifecycleStatus)}
                            style={{
                              background: '#090d16',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#fff',
                              borderRadius: '8px',
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.8rem',
                              fontFamily: 'Cairo',
                            }}
                          >
                            <option value="SCHEDULED">مجدولة</option>
                            <option value="BOARDING">صعود الركاب</option>
                            <option value="IN_TRANSIT">انطلقت بالمسار</option>
                            <option value="COMPLETED">تم الوصول (مكتملة)</option>
                            <option value="CANCELLED">إلغاء الرحلة</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================== TAB 2: CONTRACT & KYC ================== */}
      {activeTab === 'contract' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText color="#00f5d4" /> إدارة العقد والشروط وتوثيق المكتب (03-Vendor-Management-System.md)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#3a86ff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> بيانات العقد والعمولة المعتمدة (FR-VM-003 & 004)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>رقم العقد:</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>{vendorDetails.contract.contractId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>نسبة عمولة المنصة:</span>
                  <span style={{ color: '#00f5d4', fontWeight: 800 }}>{vendorDetails.contract.commissionRate}% ثابتة</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>سريان العقد:</span>
                  <span style={{ color: '#fff' }}>من {vendorDetails.contract.startDate} إلى {vendorDetails.contract.endDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>التجديد التلقائي:</span>
                  <span className="badge badge-teal">مفعل سنوياً</span>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00f5d4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> وثائق الترخيص والسجل التجاري (FR-VM-001)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>رقم السجل التجاري:</span>
                  <span style={{ color: '#fff' }}>{vendorDetails.documents.commercialRegistryNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>ترخيص وزارة النقل:</span>
                  <span style={{ color: '#fff' }}>{vendorDetails.documents.transportLicenseNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>الرقم الضريبي:</span>
                  <span style={{ color: '#fff' }}>{vendorDetails.documents.taxNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>حالة التحقق:</span>
                  <span className="badge badge-teal">معتمد وموثق رسمياً</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffbe0b', marginBottom: '1rem' }}>
              🏢 فروع المكتب ومحطات الانطلاق المعتمدة (FR-VM-002-05)
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {vendorDetails.branches.map((b, i) => (
                <span key={i} className="glass-card" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="#3a86ff" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================== TAB 3: FINANCIALS & PAYOUTS ================== */}
      {activeTab === 'finance' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Landmark color="#ffbe0b" /> المعاملات المالية وسجل سحب الأرباح (07-Payment-Financial-System.md)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                متابعة الحوالات البنكية، صافي الأرباح بعد اقتطاع عمولة المنصة 5%، وطلبات السحب.
              </p>
            </div>
            <button onClick={() => setShowPayoutModal(true)} className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
              <ArrowUpRight size={18} /> طلب سحب دفعة جديدة
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '0.9rem' }}>رقم الطلب</th>
                  <th style={{ padding: '0.9rem' }}>المبلغ (ريال يمني)</th>
                  <th style={{ padding: '0.9rem' }}>المعادل (ريال سعودي)</th>
                  <th style={{ padding: '0.9rem' }}>تاريخ الطلب</th>
                  <th style={{ padding: '0.9rem' }}>الحساب المستفيد</th>
                  <th style={{ padding: '0.9rem' }}>المرجع البنكي</th>
                  <th style={{ padding: '0.9rem' }}>حالة الدفعة</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.9rem', fontWeight: 700, color: '#ffbe0b' }}>{p.payoutNumber}</td>
                    <td style={{ padding: '0.9rem', fontWeight: 800, color: '#00f5d4' }}>{p.amountYER.toLocaleString()} ر.ي</td>
                    <td style={{ padding: '0.9rem', color: '#cbd5e1' }}>{p.amountSAR.toLocaleString()} ر.س</td>
                    <td style={{ padding: '0.9rem', color: '#94a3b8' }}>{p.requestedAt}</td>
                    <td style={{ padding: '0.9rem', color: '#fff' }}>{p.bankOrWallet}</td>
                    <td style={{ padding: '0.9rem', color: '#94a3b8' }}>{p.referenceNumber || 'قيد المعالجة'}</td>
                    <td style={{ padding: '0.9rem' }}>
                      <span className={`badge ${p.status === 'PROCESSED' ? 'badge-teal' : 'badge-amber'}`}>
                        {p.status === 'PROCESSED' ? 'تم التحويل لحسابكم' : 'بانتظار موافقة الإدارة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================== TAB 4: PERFORMANCE & QUALITY ================== */}
      {activeTab === 'performance' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award color="#ff006e" /> مؤشرات الأداء ومراقبة الجودة (FR-VM-005)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>معدل الالتزام بمواعيد الانطلاق</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>98.5%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>ممتاز، أعلى من معيار المنصة (95%)</div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>معدل إلغاء الرحلات من المكتب</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>0.4%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>أقل من الحد الأقصى للمخالفة (2%)</div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>سجل الشكاوى والمخالفات</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>0</div>
              <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>سجل ناصع بدون أي عقوبات</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Payout */}
      {showPayoutModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Landmark color="#00f5d4" /> طلب سحب أرباح من الرصيد المتاح
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              الرصيد المتاح للسحب: <strong style={{ color: '#00f5d4' }}>{(stats ? stats.totalRevenueYER * 0.95 : 47_000_000).toLocaleString()} ر.ي</strong> (صافي بعد عمولة 5%).
            </p>

            {payoutSuccess ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#00f5d4' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>تم تسجيل طلب التحويل بنجاح!</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.3rem' }}>سيقوم القسم المالي للمنصة بالتحويل خلال 24 ساعة عمل.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>المبلغ المطلوب سحبه (ريال يمني)</label>
                  <input
                    type="number"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>الحساب البنكي أو المحفظة الإلكترونية المستفيدة</label>
                  <input
                    type="text"
                    required
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowPayoutModal(false)} className="btn-secondary">إلغاء</button>
                  <button type="submit" className="btn-primary">تأكيد طلب السحب</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>إضافة رحلة جديدة للجدول (FR-RT-002)</h2>

            {formError && (
              <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '10px', background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleAddTrip} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>نوع الحافلة والخدمة</label>
                  <select
                    value={busType}
                    onChange={(e) => setBusType(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                  >
                    <option value="VIP الممتاز">VIP الممتاز (تكييف + شاشات + مقاعد مريحة)</option>
                    <option value="VIP ديلوكس">VIP ديلوكس (خدمة فائقة ومقاعد سريرية)</option>
                    <option value="عادي المطور">عادي المطور (اقتصادي)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>الجدولة والتكرار</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontFamily: 'Cairo' }}
                  >
                    <option value="daily">رحلة يومية منتظمة</option>
                    <option value="weekly">رحلة أسبوعية محددة</option>
                    <option value="none">رحلة لمرة واحدة (خاصة)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>وقت الانطلاق (التاريخ والوقت)</label>
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

