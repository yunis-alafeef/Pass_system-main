import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { VendorDashboard } from './components/VendorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ProfilePage } from './components/auth/ProfilePage';
import { AuthGuard } from './components/auth/AuthGuard';
import { HomePage } from './pages/HomePage';
import TripDetailsPage from './pages/TripDetailsPage';
import SeatMapPage from './pages/SeatMapPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useMyBookings } from './hooks/useAppData';
import { useAuth } from './context/AuthContext';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';

export const App: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: bookingsData } = useMyBookings();
  const bookingCount = user ? (bookingsData?.bookings?.length ?? 0) : 0;
  const { showWarning, remainingSeconds, stayLoggedIn } = useSessionTimeout();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>

      {/* Inactivity Session Timeout Warning Modal (FR-CP-002-02) */}
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          left: '1.25rem',
          maxWidth: '480px',
          margin: '0 auto',
          zIndex: 9999,
          background: 'rgba(19, 27, 46, 0.95)',
          border: '1px solid rgba(255, 190, 11, 0.4)',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffbe0b' }}>
            <ShieldAlert size={24} />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>تنبيه أمان الجلسة</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                سيتم إنهاء جلستك تلقائياً لعدم النشاط خلال <strong style={{ color: '#ffbe0b' }}>{remainingSeconds}</strong> ثانية
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => logout()}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            >
              <LogOut size={14} /> خروج الآن
            </button>
            <button
              onClick={stayLoggedIn}
              className="btn-primary"
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem' }}
            >
              <Clock size={14} /> البقاء مسجلاً
            </button>
          </div>
        </div>
      )}

      {/* Navbar Header */}
      <Header bookingCount={bookingCount} />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/trip/:id" element={<TripDetailsPage />} />
          <Route path="/trip/:id/seats" element={<SeatMapPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/my-tickets" element={<AuthGuard><MyTicketsPage /></AuthGuard>} />
          <Route path="/booking/:id" element={<AuthGuard><BookingDetailsPage /></AuthGuard>} />

          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />

          <Route path="/vendor/dashboard" element={
            <AuthGuard allowedRoles={['vendor', 'admin']}>
              <VendorDashboard />
            </AuthGuard>
          } />

          <Route path="/admin/dashboard" element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </AuthGuard>
          } />
        </Routes>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0', marginTop: '4rem', background: '#070a12', fontSize: '0.85rem', color: '#64748b' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: '#94a3b8' }}>Pass System</strong> — نظام إدارة النقل والحجوزات الذكي © 2026. جميع الحقوق محفوظة.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>النواة الأساسية (Core Platform)</span>
            <span>إدارة الهوية والمقاعد</span>
            <span>بوابة المدفوعات</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
