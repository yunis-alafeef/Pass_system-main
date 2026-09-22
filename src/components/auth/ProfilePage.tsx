import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Ticket, ShieldCheck, Camera, Edit2, CheckCircle2, Laptop2, Smartphone, History, Power } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'bookings'>('info');
    const [isEditing, setIsEditing] = useState(false);

    // Mock Data
    const [userProfile, setUserProfile] = useState({
        name: 'يعقوب الحكيمي',
        email: 'yaqoub@example.com',
        phone: '+967771234567',
        avatar: 'https://i.pravatar.cc/150?u=yaqoub'
    });

    const mockSessions = [
        { id: 1, device: 'Google Chrome - Windows', ip: '192.168.1.5', time: 'نشط الآن', icon: <Laptop2 size={20} />, active: true },
        { id: 2, device: 'Safari - iPhone 14', ip: '10.0.0.8', time: 'آخر نشاط: أمس 10:30 م', icon: <Smartphone size={20} />, active: false }
    ];

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        alert('تم حفظ البيانات الشخصية بنجاح!');
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert('تم تغيير كلمة المرور بنجاح!');
    };

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>

            {/* Page Header */}
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <User color="#3a86ff" /> الملف الشخصي والإعدادات
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Sidebar Nav */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1rem' }}>
                            <img src={userProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3a86ff' }} />
                            <button
                                title="تغيير الصورة"
                                style={{ position: 'absolute', bottom: 0, left: 0, background: '#3a86ff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                            >
                                <Camera size={16} />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{userProfile.name}</h3>
                        <span className="badge badge-teal" style={{ marginTop: '0.5rem' }}><CheckCircle2 size={12} /> حساب موثق</span>
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
                                            value={userProfile.name}
                                            onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
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
                                            value={userProfile.email}
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
                                            value={userProfile.phone}
                                            onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', backgroundColor: isEditing ? '#090d16' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '1rem', outline: 'none', direction: 'ltr', textAlign: 'right' }}
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">إلغاء</button>
                                        <button type="submit" className="btn-primary">حفظ التعديلات</button>
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
                                        <input type="password" placeholder="كلمة المرور الحالية" required style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <input type="password" placeholder="كلمة المرور الجديدة" required style={{ width: '100%', padding: '0.8rem 1rem', backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none' }} />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>تحديث كلمة المرور</button>
                                </form>
                            </div>

                            {/* Active Sessions */}
                            <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck color="#00f5d4" /> الأجهزة والجلسات النشطة
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {mockSessions.map(session => (
                                        <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: session.active ? 'rgba(0, 245, 212, 0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${session.active ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ color: session.active ? '#00f5d4' : '#94a3b8' }}>{session.icon}</div>
                                                <div>
                                                    <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{session.device} {session.active && <span className="badge badge-teal" style={{ marginRight: '0.5rem' }}>الحالي</span>}</h4>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{session.ip} • {session.time}</p>
                                                </div>
                                            </div>
                                            {!session.active && (
                                                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', color: '#ff006e', borderColor: 'rgba(255, 0, 110, 0.3)' }}>
                                                    <Power size={16} /> إنهاء الجلسة
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>تسجيل الخروج من جميع الأجهزة الأخرى</button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Tab: Booking History */}
                    {activeTab === 'bookings' && (
                        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
                            <Ticket size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>ليس لديك سفريات سابقة</h3>
                            <p style={{ color: '#94a3b8' }}>يبدو أنك لم تقم بأي حجز بعد. ابحث عن رحلة جديدة للبدء!</p>
                            <button className="btn-primary" style={{ marginTop: '1.5rem' }}>البحث عن رحلات</button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
