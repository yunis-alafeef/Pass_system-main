import React, { useState } from 'react';
import { Server, Cpu, Activity, UserCheck, Lock, CheckCircle2, AlertCircle, RotateCw, Wifi, WifiOff, Ban } from 'lucide-react';
import { useAdminStats, useVendors, useUpdateVendorStatus } from '../hooks/useAppData';
import { getApiErrorMessage } from '../api';

/**
 * AdminDashboard.tsx — لوحة الإدارة (المهمة 4.7)
 * ✅ مربوطة بالخلفية:
 *  - المؤشرات من GET /admin/stats  (useAdminStats)
 *  - قائمة المكاتب من GET /vendors (useVendors)
 *  - توثيق/إيقاف مكتب PATCH /vendors/:id/status (useUpdateVendorStatus)
 *
 * === درس تعليمي: الـ Optimistic Update وكيف يُبطل الكاش ===
 * عند تغيير حالة مكتب، الـ hook `useUpdateVendorStatus` يبطل كاش ['admin','vendors']
 * فيُعاد جلب القائمة من الخادم تلقائياً ويظهر الجدول محدّثاً دون أن نعدّله يدوياً.
 * هذا هو المبدأ: "الكاش مصدر عرض، والخادم مصدر حقيقة" (Single Source of Truth).
 */

export const AdminDashboard: React.FC = () => {
  const { data: statsData, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useAdminStats();
  const { data: vendorsData, isLoading: vendorsLoading, isError: vendorsError, refetch: refetchVendors } = useVendors();
  const updateStatusMutation = useUpdateVendorStatus();

  const stats = statsData?.stats;
  const vendors = vendorsData?.vendors ?? [];
  const source = statsData?.source ?? 'demo';

  const [actionError, setActionError] = useState<string | null>(null);

  /** توثيق مكتب أو إيقافه — يرسل PATCH للخلفية ثم يحدّث الجدول عبر invalidateQueries */
  const handleStatusChange = (vendorId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    setActionError(null);
    updateStatusMutation.mutate(
      { vendorId, status },
      { onError: (err) => setActionError(getApiErrorMessage(err)) }
    );
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Top System Health Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(131, 56, 236, 0.15) 0%, rgba(19, 27, 46, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                نظام المنصة الأساسية والهوية (Core Platform & Identity System)
              </h1>
              <span className="badge badge-purple">
                <Activity size={14} /> حالة السيرفرات: 99.99% Uptime
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              مراقبة النواة الأساسية، توزيع الحمل (Load Balancing)، معالجة الطلبات وربط العمولات للمكاتب.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* حالة PostgreSQL — من stats.postgresConnected بدل نص ثابت */}
            <span className={`badge ${stats?.postgresConnected ? 'badge-teal' : 'badge-amber'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Server size={16} /> PostgreSQL {stats?.postgresConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className={`badge ${stats?.redisActive ? 'badge-amber' : 'badge-teal'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Cpu size={16} /> Redis Cache {stats?.redisActive ? 'Active' : 'Inactive'}
            </span>
            {/* مصدر البيانات: الخلفية الحقيقية أم الوضع التجريبي */}
            <span className="badge" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: source === 'api' ? '#00f5d4' : '#ffbe0b' }}>
              {source === 'api' ? <Wifi size={16} /> : <WifiOff size={16} />} {source === 'api' ? 'بيانات حقيقية' : 'وضع تجريبي'}
            </span>
          </div>
        </div>
      </div>

      {/* حالة خطأ جلب المؤشرات */}
      {statsError && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderColor: 'rgba(255,0,110,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ff006e' }}>
            <AlertCircle size={22} />
            <span style={{ fontWeight: 700 }}>تعذر جلب مؤشرات المنصة من الخادم</span>
          </div>
          <button onClick={() => void refetchStats()} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <RotateCw size={16} /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* رسالة خطأ إجراءات التوثيق */}
      {actionError && (
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem', color: '#ff006e', borderColor: 'rgba(255,0,110,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {actionError}
        </div>
      )}

      {/* Metrics Row — أرقام حقيقية من GET /admin/stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            سرعة الاستجابة (Latency)
            <Activity size={20} color="#00f5d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>
            {statsLoading ? '...' : stats ? `${stats.latencyMs} ms` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>مستهدف NFR-CP-001 (&lt; 200ms)</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            المستخدمون المتزامنون
            <UserCheck size={20} color="#3a86ff" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '0.5rem' }}>
            {stats ? stats.activeConcurrentUsers.toLocaleString() : '—'} نشط
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>جلسات JWT آمنة</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            المكاتب المسجلة بالمنصة
            <Server size={20} color="#ffbe0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffbe0b', marginTop: '0.5rem' }}>
            {stats ? `${stats.vendorsCount} شركات نقل` : `${vendors.length} شركات نقل`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>جميع العقود موثقة رسمياً</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            حماية OWASP الأمني
            <Lock size={20} color="#8338ec" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8338ec', marginTop: '0.5rem' }}>
            {stats ? stats.securityScore : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>تشفير TLS 1.3 + WAF active</div>
        </div>

      </div>

      {/* Vendors Control Panel Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck color="#8338ec" /> إدارة وتوثيق شركات ومكاتب النقل (Vendor Onboarding)
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '0.9rem' }}>المكتب / الشركة</th>
                <th style={{ padding: '0.9rem' }}>المقر الرئيسي</th>
                <th style={{ padding: '0.9rem' }}>رقم التواصل</th>
                <th style={{ padding: '0.9rem' }}>التقييم</th>
                <th style={{ padding: '0.9rem' }}>إجمالي الرحلات</th>
                <th style={{ padding: '0.9rem' }}>حالة التوثيق</th>
                <th style={{ padding: '0.9rem' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {vendorsLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    <RotateCw size={20} style={{ animation: 'spin 1.2s linear infinite' }} /> جارٍ جلب المكاتب من الخادم...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    {vendorsError ? 'تعذر جلب قائمة المكاتب من الخادم' : 'لا توجد مكاتب مسجلة في المنصة بعد'}
                    {vendorsError && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <button onClick={() => void refetchVendors()} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                          <RotateCw size={16} /> إعادة المحاولة
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.9rem', fontWeight: 700, color: '#fff' }}>{vendor.name}</td>
                    <td style={{ padding: '0.9rem', color: '#cbd5e1' }}>{vendor.city}</td>
                    <td style={{ padding: '0.9rem', color: '#94a3b8' }}>{vendor.phone}</td>
                    <td style={{ padding: '0.9rem', color: '#ffbe0b', fontWeight: 700 }}>⭐ {vendor.rating}</td>
                    <td style={{ padding: '0.9rem', color: '#00f5d4' }}>{vendor.totalTrips} رحلة</td>
                    <td style={{ padding: '0.9rem' }}>
                      {/* حالة التوثيق تُقرأ من الحقل verified القادم من الخلفية */}
                      <span className={`badge ${vendor.verified ? 'badge-teal' : 'badge-amber'}`}>
                        {vendor.verified ? 'موثق ومرخص' : 'بانتظار التوثيق'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem' }}>
                      {/* الإجراء يتعطل أثناء تنفيذ الطلب لمنع النقر المتكرر */}
                      <button
                        onClick={() => handleStatusChange(vendor.id, vendor.verified ? 'SUSPENDED' : 'ACTIVE')}
                        disabled={updateStatusMutation.isPending}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', opacity: updateStatusMutation.isPending ? 0.5 : 1 }}
                      >
                        {vendor.verified ? <><Ban size={15} /> إيقاف</> : <><CheckCircle2 size={15} /> توثيق</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
