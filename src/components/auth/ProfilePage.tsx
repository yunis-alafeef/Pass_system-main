import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Lock, Ticket, ShieldCheck, Camera, Edit2, CheckCircle2, Laptop2, Smartphone, History, Power, AlertCircle, RotateCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    changePassword,
    getActiveSessions,
    revokeSession,
    revokeAllOtherSessions,
    getBookingHistory,
    cancelBooking,
    type ActiveSession,
    type BookingHistoryItem,
} from '../../services/authService';

/**
 * ProfilePage.tsx — الملف الشخصي (المهمة 2.9)
 * ثلاثة تبويبات: البيانات الشخصية / الأمان والجلسات / سجل الحجوزات
 *
 * === دروس الربط المُطبقة هنا ===
 * 1. المصدر الوحيد للحقيقة هو AuthContext: لا نُخزّن نسخة من المستخدم في useState
 *    (نسخة قديمة = تعديلات لا تظهر).
 * 2. الأفعال (حفظ/تغيير كلمة المرور) تتبع نمط: تعطيل الزر ← تنفيذ ← رسالة نجاح/خطأ.
 * 3. الجلسات تُجلب عند فتح التبويب (lazy) لا في أول تحميل الصفحة.
 */
export const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'bookings'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ---- تبويب الأمان: كلمة المرور والجلسات ----
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    // ---- تبويب الحجوزات ----
    const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    // حقول التعديل — تُهيأ من المستخدم الحالي وتُعاد ضبطها عند فتح/إغلاق التعديل
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        setFullName(user?.fullName ?? '');
        setPhone(user?.phone ?? '');
    }, [user]);

    // جلب الجلسات النشطة عند فتح تبويب الأمان
    useEffect(() => {
        if (activeTab !== 'security') return;
        let cancelled = false;
        setSessionsLoading(true);
        getActiveSessions()
            .then((res) => { if (!cancelled) setSessions(res); })
            .catch((err) => { if (!cancelled) setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'تعذر جلب الجلسات' }); })
            .finally(() => { if (!cancelled) setSessionsLoading(false); });
        return () => { cancelled = true; };
    }, [activeTab]);

    // جلب سجل الحجوزات عند فتح تبويب الحجوزات
    useEffect(() => {
        if (activeTab !== 'bookings') return;
        let cancelled = false;
        setBookingsLoading(true);
        getBookingHistory()
            .then((res) => { if (!cancelled) setBookings(res); })
            .catch(() => { if (!cancelled) setBookings([]); })
            .finally(() => { if (!cancelled) setBookingsLoading(false); });
        return () => { cancelled = true; };
    }, [activeTab]);

    /** حفظ التعديلات — يحدّث الخادم (PATCH /auth/me) ثم حالة السياق */
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFeedback(null);
        try {
            await updateUser({ fullName, phone });
            setIsEditing(false);
            setFeedback({ type: 'success', text: 'تم حفظ البيانات الشخصية بنجاح' });
        } catch (err) {
            setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'تعذر حفظ التعديلات' });
        } finally {
            setIsSaving(false);
        }
    };

    /** تغيير كلمة المرور — POST /auth/change-password */
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setFeedback(null);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setFeedback({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
        } catch (err) {
            setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'تعذر تغيير كلمة المرور' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    /** إنهاء جلسة محددة ثم تحديث القائمة */
    const handleRevokeSession = async (sessionId: string) => {
        await revokeSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setFeedback({ type: 'success', text: 'تم إنهاء الجلسة' });
    };

    const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

    /** إلغاء حجز محدد مع تأكيد مدمج في الواجهة */
    const handleCancelBooking = async (bookingId: string) => {
        await cancelBooking(bookingId);
        setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
        );
        setConfirmCancelId(null);
        setFeedback({ type: 'success', text: 'تم إلغاء الحجز بنجاح وتحويل المبلغ لحساب الاسترداد' });
    };

    /** إنهاء جميع الجلسات الأخرى */
    const handleRevokeAll = async () => {
        await revokeAllOtherSessions();
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        setFeedback({ type: 'success', text: 'تم إنهاء جميع الجلسات الأخرى' });
    };

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

            {/* Page Header */}
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <User color="#3a86ff" /> الملف الشخصي والإعدادات
            </h1>

            {/* رسالة نتيجة عامة (نجاح/خطأ) */}
            {feedback && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem',
                    padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600,
                    background: feedback.type === 'success' ? 'rgba(0, 245, 212, 0.08)' : 'rgba(255, 0, 110, 0.08)',
                    border: `1px solid ${feedback.type === 'success' ? 'rgba(0, 245, 212, 0.3)' : 'rgba(255, 0, 110, 0.3)'}`,
                    color: feedback.type === 'success' ? '#00f5d4' : '#ff006e',
                }}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {feedback.text}
                </div>
            )}

            <div className="profile-layout-grid" style={{ display: 'grid', gap: '1.5rem', alignItems: 'start' }}>

                {/* Sidebar Nav */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem' }}>
                            {/* الصورة تأتي من المستخدم الحالي في السياق (user.avatar) */}
                            <img
                                src={user?.avatar || `https://i.pravatar.cc/150?u=${user?.id ?? 'guest'}`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3a86ff' }}
                            />
                            <button
                                title="تغيير الصورة"
                                style={{ position: 'absolute', bottom: 0, left: 0, background: '#3a86ff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                            >
                                <Camera size={16} />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{user?.fullName ?? '—'}</h3>
                        <span className="badge badge-teal" style={{ marginTop: '0.5rem' }}>
                            <CheckCircle2 size={12} /> {user?.isVerified ? 'حساب موثق' : 'بانتظار التوثيق'}
                        </span>
                    </div>

                    <button
                        onClick={() => setActiveTab('info')}
                        className={activeTab === 'info' ? 'btn-primary' : 'btn-secondary'}
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1rem' }}
                    >
                        <User size={18} /> البيانات الشخصية
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1rem' }}
                    >
                        <ShieldCheck size={18} /> الأمان والجلسات
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem 1rem' }}
                    >
                        <History size={18} /> سجل الحجوزات
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Tab: Personal Info */}
                    {activeTab === 'info' && (
                        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>المعلومات الأساسية</h2>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                        <Edit2 size={16} /> تعديل البيانات
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>الاسم الكامل</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', backgroundColor: isEditing ? '#090d16' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>البريد الإلكتروني (لا يمكن تعديله)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email ?? ''}
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#94a3b8', fontFamily: 'Cairo', fontSize: '1rem', outline: 'none', direction: 'ltr', textAlign: 'right' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>رقم الهاتف</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', backgroundColor: isEditing ? '#090d16' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '1rem', outline: 'none', direction: 'ltr', textAlign: 'right' }}
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => { setIsEditing(false); setFullName(user?.fullName ?? ''); setPhone(user?.phone ?? ''); }} className="btn-secondary">إلغاء</button>
                                        <button type="submit" className="btn-primary" disabled={isSaving}>
                                            {isSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Tab: Security & Sessions */}
                    {activeTab === 'security' && (
                        <>
                            {/* Change Password */}
                            <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Lock color="#ffbe0b" /> تغيير كلمة المرور
                                </h2>
                                <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', maxWidth: '400px' }}>
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="كلمة المرور الحالية"
                                            required
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="كلمة المرور الجديدة"
                                            required
                                            minLength={8}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none' }}
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={isChangingPassword} style={{ marginTop: '0.5rem', opacity: isChangingPassword ? 0.7 : 1 }}>
                                        {isChangingPassword ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
                                    </button>
                                </form>
                            </div>

                            {/* Active Sessions */}
                            <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck color="#00f5d4" /> الأجهزة والجلسات النشطة
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {sessionsLoading ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                                            <RotateCw size={20} style={{ animation: 'spin 1.2s linear infinite' }} /> جارٍ جلب الجلسات...
                                        </div>
                                    ) : sessions.length === 0 ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>لا توجد جلسات نشطة</div>
                                    ) : (
                                        sessions.map(session => (
                                            <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: session.isCurrent ? 'rgba(0, 245, 212, 0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${session.isCurrent ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {/* أيقونة حسب نوع الجهاز: موبايل أم حاسب */}
                                                    <div style={{ color: session.isCurrent ? '#00f5d4' : '#94a3b8' }}>
                                                        {/iPhone|Android|Mobile/i.test(session.device) ? <Smartphone size={20} /> : <Laptop2 size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
                                                            {session.device}{' '}
                                                            {session.isCurrent && <span className="badge badge-teal" style={{ marginRight: '0.5rem' }}>الحالي</span>}
                                                        </h4>
                                                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                            {session.browser ? `${session.browser} • ` : ''}{session.ip} • {session.lastActive}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!session.isCurrent && (
                                                    <button
                                                        onClick={() => void handleRevokeSession(session.id)}
                                                        className="btn-secondary"
                                                        style={{ padding: '0.5rem 1rem', color: '#ff006e', borderColor: 'rgba(255, 0, 110, 0.3)' }}
                                                    >
                                                        <Power size={16} /> إنهاء الجلسة
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                    <button onClick={() => void handleRevokeAll()} className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                                        تسجيل الخروج من جميع الأجهزة الأخرى
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Tab: Booking History */}
                    {activeTab === 'bookings' && (
                        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <History color="#3a86ff" /> سجل الحجوزات
                            </h2>
                            {bookingsLoading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <RotateCw size={20} style={{ animation: 'spin 1.2s linear infinite' }} /> جارٍ الجلب...
                                </div>
                            ) : bookings.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center' }}>
                                    <Ticket size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>ليس لديك سفريات سابقة</h3>
                                    <p style={{ color: '#94a3b8' }}>يبدو أنك لم تقم بأي حجز بعد. ابحث عن رحلة جديدة للبدء!</p>
                                    <Link to="/" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex', textDecoration: 'none' }}>البحث عن رحلات</Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {bookings.map((b) => {
                                        const isCancelled = b.status === 'cancelled';
                                        return (
                                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', flexWrap: 'wrap', gap: '0.85rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>{b.route}</span>
                                                        <span className={`badge ${isCancelled ? 'badge-amber' : 'badge-teal'}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                                                            {isCancelled ? 'تم الإلغاء والاسترداد' : 'حجز مؤكد'}
                                                        </span>
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.35rem' }}>
                                                        رمز الحجز: <strong style={{ color: '#3a86ff' }}>{b.bookingCode}</strong> • التاريخ: {b.date} • المقاعد: <span style={{ color: '#00f5d4' }}>{b.seats}</span>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                                    <div style={{ color: '#00f5d4', fontWeight: 800, fontSize: '1.05rem' }}>{b.priceYER.toLocaleString()} ر.ي</div>

                                                    {!isCancelled && (
                                                        confirmCancelId === b.id ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                <button
                                                                    onClick={() => void handleCancelBooking(b.id)}
                                                                    className="btn-primary"
                                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', background: '#ff006e' }}
                                                                >
                                                                    تأكيد الإلغاء
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmCancelId(null)}
                                                                    className="btn-secondary"
                                                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem' }}
                                                                >
                                                                    تراجع
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmCancelId(b.id)}
                                                                className="btn-secondary"
                                                                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: '#ff006e', borderColor: 'rgba(255,0,110,0.3)' }}
                                                            >
                                                                إلغاء الحجز
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
