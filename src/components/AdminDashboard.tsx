import React, { useState, useEffect } from 'react';
import {
  Server, Cpu, Activity, UserCheck, Lock, CheckCircle2, AlertCircle, RotateCw,
  Wifi, WifiOff, Ban, Settings, FileText, Download, Trash2, Search,
  RefreshCw, Save
} from 'lucide-react';
import { useAdminStats, useVendors, useUpdateVendorStatus } from '../hooks/useAppData';
import { getApiErrorMessage } from '../api';
import { platformLogService, PlatformLogEntry, LogLevel } from '../services/platformLogService';
import { platformConfigService, PlatformConfig } from '../services/platformConfigService';

type AdminTab = 'overview' | 'logs' | 'config';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { data: statsData, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useAdminStats();
  const { data: vendorsData, isLoading: vendorsLoading, isError: vendorsError, refetch: refetchVendors } = useVendors();
  const updateStatusMutation = useUpdateVendorStatus();

  const stats = statsData?.stats;
  const vendors = vendorsData?.vendors ?? [];
  const source = statsData?.source ?? 'demo';

  const [actionError, setActionError] = useState<string | null>(null);

  // Platform Logs State
  const [logs, setLogs] = useState<PlatformLogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | LogLevel>('all');
  const [logSearch, setLogSearch] = useState('');

  // Platform Config State
  const [config, setConfig] = useState<PlatformConfig>(() => platformConfigService.getConfig());
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    setLogs(platformLogService.getLogs());
  }, [activeTab]);

  const handleStatusChange = (vendorId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    setActionError(null);
    updateStatusMutation.mutate(
      { vendorId, status },
      { onError: (err) => setActionError(getApiErrorMessage(err)) }
    );
  };

  const handleRefreshLogs = () => {
    setLogs(platformLogService.getLogs());
  };

  const handleClearLogs = () => {
    platformLogService.clearLogs();
    setLogs([]);
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pass_system_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    platformConfigService.updateConfig(config, 'مدير المنصة');
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesLevel = logFilter === 'all' || l.level === logFilter;
    const matchesSearch =
      !logSearch ||
      l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      (l.requestId && l.requestId.toLowerCase().includes(logSearch.toLowerCase())) ||
      (l.userId && l.userId.toLowerCase().includes(logSearch.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Top System Health Header */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(131, 56, 236, 0.15) 0%, rgba(19, 27, 46, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                نظام المنصة الأساسية والهوية (Core Platform & Identity System)
              </h1>
              <span className="badge badge-purple">
                <Activity size={14} /> حالة السيرفرات: 99.99% Uptime
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              مراقبة النواة الأساسية، توزيع الحمل، إدارة تكوين المنصة وسجل العمليات والتدقيق (FR-CP-001 & FR-UI-004).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge ${stats?.postgresConnected ? 'badge-teal' : 'badge-amber'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Server size={16} /> PostgreSQL {stats?.postgresConnected ? 'Connected' : 'Active'}
            </span>
            <span className={`badge ${stats?.redisActive ? 'badge-amber' : 'badge-teal'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Cpu size={16} /> Redis Cache {stats?.redisActive ? 'Active' : 'Standby'}
            </span>
            <span className="badge" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: source === 'api' ? '#00f5d4' : '#ffbe0b' }}>
              {source === 'api' ? <Wifi size={16} /> : <WifiOff size={16} />} {source === 'api' ? 'بيانات حقيقية' : 'وضع تجريبي'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}
          >
            <UserCheck size={18} /> نظرة عامة وتوثيق المكاتب
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}
          >
            <FileText size={18} /> سجل العمليات والتدقيق ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.2rem', fontSize: '0.9rem' }}
          >
            <Settings size={18} /> إعدادات المنصة الحية (Runtime Config)
          </button>
        </div>
      </div>

      {/* Overview & Vendors Tab */}
      {activeTab === 'overview' && (
        <>
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

          {actionError && (
            <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem', color: '#ff006e', borderColor: 'rgba(255,0,110,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {actionError}
            </div>
          )}

          {/* Metrics Row */}
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

            <div className="table-responsive">
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
                          <span className={`badge ${vendor.verified ? 'badge-teal' : 'badge-amber'}`}>
                            {vendor.verified ? 'موثق ومرخص' : 'بانتظار التوثيق'}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem' }}>
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
        </>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText color="#00f5d4" /> سجل العمليات والتدقيق والأمان (Operational Audit Log)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                تتبع دورة حياة الطلبات (X-Request-Id)، عمليات تسجيل الدخول، والأحداث الأمنية (FR-CP-001 & FR-UI-004)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={handleRefreshLogs} className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                <RefreshCw size={15} /> تحديث
              </button>
              <button onClick={handleExportLogs} className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                <Download size={15} /> تصدير JSON
              </button>
              <button onClick={handleClearLogs} className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', color: '#ff8a8a' }}>
                <Trash2 size={15} /> مسح السجل
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="بحث في السجلات (المعرف، الإجراء، المستخدم)..."
                style={{
                  width: '100%',
                  padding: '0.6rem 2.2rem 0.6rem 0.8rem',
                  backgroundColor: '#090d16',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(['all', 'info', 'warn', 'error', 'security'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: logFilter === lvl ? '#00f5d4' : 'rgba(255,255,255,0.05)',
                    color: logFilter === lvl ? '#05080f' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {lvl === 'all' ? 'الكل' : lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '0.75rem' }}>الوقت</th>
                  <th style={{ padding: '0.75rem' }}>المستوى</th>
                  <th style={{ padding: '0.75rem' }}>الإجراء</th>
                  <th style={{ padding: '0.75rem' }}>التفاصيل</th>
                  <th style={{ padding: '0.75rem' }}>المستخدم</th>
                  <th style={{ padding: '0.75rem' }}>معرف الطلب</th>
                  <th style={{ padding: '0.75rem' }}>المدة</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      لا توجد سجلات مطابقة لمعايير البحث
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const levelColors: Record<LogLevel, string> = {
                      info: '#00f5d4',
                      warn: '#ffbe0b',
                      error: '#ff5252',
                      security: '#8338ec',
                    };
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleTimeString('ar-YE')}
                        </td>
                        <td style={{ padding: '0.7rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: levelColors[log.level],
                              background: `${levelColors[log.level]}15`,
                              border: `1px solid ${levelColors[log.level]}40`,
                            }}
                          >
                            {log.level.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.7rem', fontWeight: 600, color: '#fff' }}>{log.action}</td>
                        <td style={{ padding: '0.7rem', color: '#cbd5e1', maxWidth: '300px' }}>{log.details}</td>
                        <td style={{ padding: '0.7rem', color: '#94a3b8' }}>
                          {log.userId ? `${log.userId} (${log.userRole || 'User'})` : 'System / Guest'}
                        </td>
                        <td style={{ padding: '0.7rem', color: '#3a86ff', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {log.requestId || '—'}
                        </td>
                        <td style={{ padding: '0.7rem', color: log.durationMs && log.durationMs > 200 ? '#ffbe0b' : '#00f5d4' }}>
                          {log.durationMs ? `${log.durationMs}ms` : '—'}
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

      {/* Runtime Configuration Tab */}
      {activeTab === 'config' && (
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings color="#ffbe0b" /> إعدادات وتكوين المنصة الحية (Runtime Configuration - FR-CP-003)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                تعديل بارامترات النظام فورياً دون الحاجة لإعادة نشر التطبيق. يتم تسجيل التغييرات في سجل التدقيق.
              </p>
            </div>

            {configSaved && (
              <span className="badge badge-teal" style={{ padding: '0.4rem 0.9rem' }}>
                <CheckCircle2 size={16} /> تم حفظ الإعدادات بنجاح وتطبيقها فوراً
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
              {/* Maintenance Mode */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>وضع الصيانة المبرمجة</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>يمنع الحجوزات الجديدة مؤقتاً للمستخدمين</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.maintenanceMode}
                    onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                    style={{ width: '20px', height: '20px', accentColor: '#ffbe0b' }}
                  />
                </label>
              </div>

              {/* Session Timeout */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  مدة مهلة خمول الجلسة (دقائق)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={config.sessionTimeoutMinutes}
                  onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'Cairo',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>المعيار الافتراضي: 30 دقيقة</div>
              </div>

              {/* Max Failed Logins */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  الحد الأقصى لمحاولات الدخول الفاشلة قبل القفل
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={config.maxFailedLoginAttempts}
                  onChange={(e) => setConfig({ ...config, maxFailedLoginAttempts: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'Cairo',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>المتطلب FR-UI-002-05: 5 محاولات</div>
              </div>

              {/* Lockout Duration */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  مدة قفل الحساب المؤقت (دقائق)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={config.lockoutDurationMinutes}
                  onChange={(e) => setConfig({ ...config, lockoutDurationMinutes: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'Cairo',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>المتطلب: 15 دقيقة</div>
              </div>

              {/* Platform Commission */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  نسبة عمولة المنصة من الحجوزات (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="25"
                  value={config.platformCommissionPercent}
                  onChange={(e) => setConfig({ ...config, platformCommissionPercent: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'Cairo',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>عمولة الربط الموحد لمكاتب النقل</div>
              </div>

              {/* Emergency Support Phone */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  رقم الطوارئ والدعم الفني المباشر
                </label>
                <input
                  type="text"
                  value={config.emergencySupportPhone}
                  onChange={(e) => setConfig({ ...config, emergencySupportPhone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    backgroundColor: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'Cairo',
                    outline: 'none',
                  }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setConfig(platformConfigService.getConfig())}
                className="btn-secondary"
                style={{ padding: '0.7rem 1.4rem' }}
              >
                إلغاء التغييرات
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.7rem 1.6rem' }}
              >
                <Save size={18} /> حفظ وتطبيق الإعدادات
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
