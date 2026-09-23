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

export const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>

      {/* Navbar Header */}
      <Header bookingCount={0} />

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
