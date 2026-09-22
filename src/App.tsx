import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { TripCard } from './components/TripCard';
import { SeatMapModal } from './components/SeatMapModal';
import { BookingFormModal } from './components/BookingFormModal';
import { TicketModal } from './components/TicketModal';
import { VendorDashboard } from './components/VendorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ProfilePage } from './components/auth/ProfilePage';
import { AuthGuard } from './components/auth/AuthGuard';
import { mockTrips } from './data/mockData';
import { Trip, Booking, TripType } from './types';
import { Bus, ShieldCheck, Ticket, Compass, Sparkles, Filter } from 'lucide-react';

export const App: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
 
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(mockTrips);

  // Selection & Modal states
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // Search handler
  const handleSearch = (filters: { origin: string; destination: string; date: string; tripType: TripType | 'all' }) => {
    let result = [...trips];

    if (filters.origin) {
      result = result.filter(t => t.origin.includes(filters.origin));
    }
    if (filters.destination) {
      result = result.filter(t => t.destination.includes(filters.destination));
    }
    if (filters.tripType && filters.tripType !== 'all') {
      result = result.filter(t => t.tripType === filters.tripType);
    }

    setFilteredTrips(result);
  };

  // Seat selection handler
  const handleOpenSeatMap = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowSeatModal(true);
  };

  const handleProceedToBooking = (seats: string[], isWomenOnly: boolean) => {
    setSelectedSeats(seats);
    setShowSeatModal(false);
    setShowBookingModal(true);
  };

  const handleBookingComplete = (booking: Booking) => {
    setUserBookings([booking, ...userBookings]);
    setActiveBooking(booking);
    setShowBookingModal(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>

      {/* Navbar Header */}
      <Header
        bookingCount={userBookings.length}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <div className="container">
              {/* Hero Welcome Banner */}
              <div style={{ textAlign: 'center', paddingTop: '2.5rem', paddingBottom: '1rem' }} className="animate-fade-in">
                <span className="badge badge-teal" style={{ marginBottom: '0.75rem', fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}>
                  <Sparkles size={14} /> المنصة الرقمية الأولى لحجوزات النقل في اليمن
                </span>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', lineHeight: '1.2' }}>
                  احجز تذكرتك بكل سهولة وأمان عبر <span style={{ background: 'linear-gradient(90deg, #3a86ff, #00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pass System</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
                  ربط موحد ومباشر بين مكاتب النقل الداخلي بين المحافظات اليمنية والنقل الدولي بين اليمن والمملكة العربية السعودية.
                </p>
              </div>

              {/* Search Component */}
              <SearchForm onSearch={handleSearch} />

              {/* Trip Results Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass color="#3a86ff" /> الرحلات المتاحة ({filteredTrips.length})
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Filter size={14} /> خيارات الترتيب: الأسعار والتوفر المباشر
                </span>
              </div>

              {/* Trips List */}
              {filteredTrips.length > 0 ? (
                filteredTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onSelectSeats={handleOpenSeatMap} />
                ))
              ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Bus size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>عذراً، لم يتم العثور على رحلات مطابقة</h3>
                  <p>يرجى تغيير معايير البحث أو اختيار تاريخ آخر.</p>
                </div>
              )}
            </div>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/my-tickets" element={
            <AuthGuard>
              <div className="container animate-fade-in" style={{ paddingTop: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Ticket color="#00f5d4" /> سِجِل حجوزاتي وتذاكري الرقمية
                </h1>

                {userBookings.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {userBookings.map((b) => (
                      <div key={b.id} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span className="badge badge-teal">تذكرة مؤكدة</span>
                          <span style={{ fontSize: '0.85rem', color: '#ffbe0b', fontWeight: 700 }}>{b.bookingCode}</span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{b.trip.vendorName}</h3>
                        <div style={{ fontSize: '0.9rem', color: '#00f5d4', margin: '0.4rem 0', fontWeight: 700 }}>
                          {b.trip.origin} ➔ {b.trip.destination}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                          المقاعد: ({b.seats.join(', ')}) • التاريخ: {b.bookingDate}
                        </div>

                        <button
                          onClick={() => setActiveBooking(b)}
                          className="btn-primary"
                          style={{ width: '100%', fontSize: '0.9rem' }}
                        >
                          استعراض وطباعة التذكرة
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Ticket size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>لا توجد حجوزات سابقة حتى الآن</h3>
                    <p>قم بالبحث عن رحلة واختيار المقاعد لإصدار تذكرتك الأولى.</p>
                  </div>
                )}
              </div>
            </AuthGuard>
          } />

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

      {/* Modals render conditionally */}
      {showSeatModal && selectedTrip && (
        <SeatMapModal
          trip={selectedTrip}
          onClose={() => setShowSeatModal(false)}
          onProceedToBooking={handleProceedToBooking}
        />
      )}

      {showBookingModal && selectedTrip && (
        <BookingFormModal
          trip={selectedTrip}
          selectedSeats={selectedSeats}
          onClose={() => setShowBookingModal(false)}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {activeBooking && (
        <TicketModal
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
        />
      )}

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
