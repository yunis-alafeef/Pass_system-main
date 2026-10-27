import React, { useState, useEffect } from 'react';
import {
  Bus, LayoutDashboard, Ticket, Sparkles, User,
  Menu, X, LogIn, UserPlus, LogOut, ShieldCheck,
  Building2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  bookingCount: number;
}

export const Header: React.FC<HeaderProps> = ({ bookingCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const roleLabel = role === 'admin' ? 'مشرف المنصة' : role === 'vendor' ? 'مكتب نقل' : 'مسافر';

  return (
    <header className="header-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', minHeight: '68px' }}>

        {/* Brand Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => handleNav('/')}
        >
          <div style={{
            background: 'linear-gradient(135deg, #3a86ff 0%, #00f5d4 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(58, 134, 255, 0.4)',
            flexShrink: 0
          }}>
            <Bus size={22} color="#090d16" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                PASS SYSTEM
              </span>
              <span className="badge badge-teal" style={{ padding: '0.1rem 0.4rem', fontSize: '0.68rem' }}>
                <Sparkles size={9} /> v1.0
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '-2px' }}>
              المنصة الذكية لإدارة النقل والحجوزات
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => handleNav('/')}
            className={currentPath === '/' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem' }}
          >
            <Bus size={16} />
            <span>الرحلات والبحث</span>
          </button>

          <button
            onClick={() => handleNav('/my-tickets')}
            className={currentPath === '/my-tickets' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem', position: 'relative' }}
          >
            <Ticket size={16} />
            <span>حجوزاتي</span>
            {bookingCount > 0 && (
              <span style={{
                background: '#ff006e',
                color: '#fff',
                borderRadius: '999px',
                padding: '0.1rem 0.4rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                marginRight: '0.2rem'
              }}>
                {bookingCount}
              </span>
            )}
          </button>

          {(role === 'vendor' || role === 'admin' || !isAuthenticated) && (
            <button
              onClick={() => handleNav('/vendor/dashboard')}
              className={currentPath.includes('/vendor') ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem' }}
              title="لوحة تحكم مكاتب وشركات النقل"
            >
              <Building2 size={16} />
              <span>لوحة المزودين</span>
            </button>
          )}

          {(role === 'admin' || !isAuthenticated) && (
            <button
              onClick={() => handleNav('/admin/dashboard')}
              className={currentPath.includes('/admin') ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem' }}
              title="لوحة إدارة المنصة المركزية"
            >
              <LayoutDashboard size={16} />
              <span>نظام الإدارة</span>
            </button>
          )}

          {/* User Auth Buttons or Profile Pill */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
              <button
                onClick={() => handleNav('/profile')}
                className={currentPath === '/profile' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}
              >
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                  alt=""
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName.split(' ')[0]}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                  {roleLabel}
                </span>
              </button>

              <button
                onClick={() => void logout()}
                className="btn-secondary"
                style={{ padding: '0.55rem', borderRadius: '10px', color: '#ff006e', borderColor: 'rgba(255,0,110,0.3)' }}
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
              <button
                onClick={() => handleNav('/login')}
                className={currentPath === '/login' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem' }}
              >
                <LogIn size={16} />
                <span>دخول</span>
              </button>
              <button
                onClick={() => handleNav('/register')}
                className={currentPath === '/register' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem', background: 'rgba(0, 245, 212, 0.1)', color: '#00f5d4', borderColor: 'rgba(0, 245, 212, 0.3)' }}
              >
                <UserPlus size={16} />
                <span>تسجيل جديد</span>
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Header Right: Status + Hamburger Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="glass-card" style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: '#00f5d4' }}>
            <ShieldCheck size={14} />
            <span style={{ display: 'inline-block' }}>آمن TLS 1.3</span>
          </div>

          <button
            type="button"
            className="mobile-menu-btn btn-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '0.55rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer'
            }}
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation (FR-CP / Responsive UX) */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer animate-fade-in"
          style={{
            background: 'rgba(9, 13, 22, 0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderBottom: '2px solid rgba(58, 134, 255, 0.3)',
            padding: '1.25rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}
        >
          {/* User state in mobile drawer */}
          {isAuthenticated && user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                  alt=""
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3a86ff' }}
                />
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>{user.fullName}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>{user.email || user.phone}</div>
                </div>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>{roleLabel}</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => handleNav('/login')}
                className="btn-primary"
                style={{ padding: '0.65rem', fontSize: '0.88rem' }}
              >
                <LogIn size={16} /> تسجيل الدخول
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="btn-secondary"
                style={{ padding: '0.65rem', fontSize: '0.88rem', color: '#00f5d4', borderColor: 'rgba(0, 245, 212, 0.3)' }}
              >
                <UserPlus size={16} /> حساب جديد
              </button>
            </div>
          )}

          {/* Links list */}
          <button
            onClick={() => handleNav('/')}
            className={currentPath === '/' ? 'btn-primary' : 'btn-secondary'}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
          >
            <Bus size={18} />
            <span>الرحلات والبحث</span>
          </button>

          <button
            onClick={() => handleNav('/my-tickets')}
            className={currentPath === '/my-tickets' ? 'btn-primary' : 'btn-secondary'}
            style={{ width: '100%', justifyContent: 'space-between', padding: '0.75rem 1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={18} />
              <span>حجوزاتي وتذاكري</span>
            </div>
            {bookingCount > 0 && (
              <span style={{
                background: '#ff006e',
                color: '#fff',
                borderRadius: '999px',
                padding: '0.15rem 0.55rem',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                {bookingCount} حجز
              </span>
            )}
          </button>

          <button
            onClick={() => handleNav('/vendor/dashboard')}
            className={currentPath.includes('/vendor') ? 'btn-primary' : 'btn-secondary'}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
          >
            <Building2 size={18} />
            <span>لوحة المزودين (مكاتب النقل)</span>
          </button>

          <button
            onClick={() => handleNav('/admin/dashboard')}
            className={currentPath.includes('/admin') ? 'btn-primary' : 'btn-secondary'}
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
          >
            <LayoutDashboard size={18} />
            <span>نظام الإدارة المركزي (Core)</span>
          </button>

          {isAuthenticated && (
            <>
              <button
                onClick={() => handleNav('/profile')}
                className={currentPath === '/profile' ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <User size={18} />
                <span>الملف الشخصي والجلسات</span>
              </button>

              <button
                onClick={() => void logout()}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', color: '#ff006e', borderColor: 'rgba(255,0,110,0.3)', marginTop: '0.5rem' }}
              >
                <LogOut size={18} />
                <span>تسجيل الخروج</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
