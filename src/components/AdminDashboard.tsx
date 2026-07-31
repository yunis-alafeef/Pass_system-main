import React from 'react';
import { LayoutDashboard, Server, ShieldAlert, Cpu, Database, Activity, UserCheck, Lock, CheckCircle2 } from 'lucide-react';
import { mockVendors } from '../data/mockData';

export const AdminDashboard: React.FC = () => {
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

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span className="badge badge-teal" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Server size={16} /> PostgreSQL Connected
            </span>
            <span className="badge badge-amber" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Cpu size={16} /> Redis Cache Active
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            سرعة الاستجابة (Latency)
            <Activity size={20} color="#00f5d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00f5d4', marginTop: '0.5rem' }}>
            45 ms
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>مستهدف NFR-CP-001 (&lt; 200ms)</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            المستخدمون المتزامنون
            <UserCheck size={20} color="#3a86ff" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: '0.5rem' }}>
            3,480 نشط
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>جلسات JWT آمنة</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            المكاتب المسجلة بالمنصة
            <Server size={20} color="#ffbe0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffbe0b', marginTop: '0.5rem' }}>
            {mockVendors.length} شركات نقل
          </div>
          <div style={{ fontSize: '0.75rem', color: '#00f5d4', marginTop: '0.3rem' }}>جميع العقود موثقة رسمياً</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            حماية OWASP الأمني
            <Lock size={20} color="#8338ec" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8338ec', marginTop: '0.5rem' }}>
            100% محمية
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
              </tr>
            </thead>
            <tbody>
              {mockVendors.map((vendor) => (
                <tr key={vendor.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.9rem', fontWeight: 700, color: '#fff' }}>{vendor.name}</td>
                  <td style={{ padding: '0.9rem', color: '#cbd5e1' }}>{vendor.city}</td>
                  <td style={{ padding: '0.9rem', color: '#94a3b8' }}>{vendor.phone}</td>
                  <td style={{ padding: '0.9rem', color: '#ffbe0b', fontWeight: 700 }}>⭐ {vendor.rating}</td>
                  <td style={{ padding: '0.9rem', color: '#00f5d4' }}>{vendor.totalTrips} رحلة</td>
                  <td style={{ padding: '0.9rem' }}>
                    <span className="badge badge-teal">موثق ومرخص</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
