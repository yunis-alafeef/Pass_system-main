import React from 'react';
import { Bus, ShieldCheck, UserCheck, LayoutDashboard, Ticket, Sparkles, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  bookingCount: number;
}

export const Header: React.FC<HeaderProps> = ({ bookingCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="header-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>

        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            background: 'linear-gradient(135deg, #3a86ff 0%, #00f5d4 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(58, 134, 255, 0.4)'
          }}>
            <Bus size={24} color="#090d16" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PASS SYSTEM
              </span>
              <span className="badge badge-teal" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                <Sparkles size={10} /> v1.0
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '-4px' }}>
              المنصة الذكية لإدارة النقل والحجوزات
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/')}
            className={currentPath === '/' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem' }}
          >
            <Bus size={18} />
            <span>الرحلات والحجز</span>
          </button>

          <button
            onClick={() => navigate('/my-tickets')}
            className={currentPath === '/my-tickets' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem', position: 'relative' }}
          >
            <Ticket size={18} />
            <span>حجوزاتي</span>
            {bookingCount > 0 && (
              <span style={{
                background: '#ff006e',
                color: '#fff',
                borderRadius: '999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {bookingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/vendor/dashboard')}
            className={currentPath.includes('/vendor') ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem' }}
          >
            <UserCheck size={18} />
            <span>لوحة المزودين</span>
          </button>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className={currentPath.includes('/admin') ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem' }}
          >
            <LayoutDashboard size={18} />
            <span>نظام الإدارة (Core)</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className={currentPath === '/login' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem' }}
          >
            <UserCheck size={18} />
            <span>تسجيل الدخول</span>
          </button>

          <button
            onClick={() => navigate('/register')}
            className={currentPath === '/register' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem' }}
          >
            <Sparkles size={18} />
            <span>إنشاء حساب</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={currentPath === '/profile' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="الملف الشخصي"
          >
            <User size={18} />
          </button>
        </nav>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#00f5d4' }}>
            <ShieldCheck size={16} />
            <span>النظام نشط وآمن</span>
          </div>
        </div>

      </div>
    </header>
  );
};
