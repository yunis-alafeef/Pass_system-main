/**
 * AuthGuard.tsx — حماية المسارات (المهمة 4.9)
 * 1) من غير جلسة → تحويل إلى /login مع حفظ الصفحة المقصودة (state.from)
 * 2) جلسة منتهية (exp في JWT) → تنظيف + تحويل لصفحة الدخول برسالة انتهاء الجلسة
 * 3) جلسة سليمة لكن الدور غير مسموح → شاشة 403 (ليس redirect حتى لا يضيع المستخدم)
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { decodeJwtPayload, tokenStore, type UserRole } from '../../services/authService';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

/** هل انتهت صلاحية الـ token؟ (مع هامش 30 ثانية) */
const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;
    return payload.exp * 1000 < Date.now() - 30_000;
};

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const token = tokenStore.access;

    // 1) لا جلسة إطلاقاً → تسجيل الدخول مع العودة للصفحة المطلوبة بعد الدخول
    if (!token || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2) جلسة منتهية → تنظيف فوري وتحويل للدخول
    if (isTokenExpired(token)) {
        void logout();
        return <Navigate to="/login" state={{ from: location, expired: true }} replace />;
    }

    // 3) فحص الصلاحيات (RBAC) حسب دور المستخدم في الجلسة
    if (allowedRoles && allowedRoles.length > 0) {
        const jwtRole = decodeJwtPayload(token)?.role;
        const effectiveRole = (typeof jwtRole === 'string' && ['customer', 'vendor', 'admin'].includes(jwtRole)
            ? (jwtRole as UserRole)
            : user.role);

        if (!allowedRoles.includes(effectiveRole)) {
            return <AccessDeniedScreen />;
        }
    }

    return <>{children}</>;
};

/** شاشة رفض الوصول (403) */
const AccessDeniedScreen: React.FC = () => (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '3rem', textAlign: 'center' }}>
            <div style={{
                background: 'rgba(255, 0, 110, 0.1)',
                border: '1px solid rgba(255, 0, 110, 0.3)',
                width: '72px', height: '72px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
            }}>
                <ShieldAlert size={36} color="#ff006e" />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
                وصول مرفوض (403)
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
                لا تمتلك الصلاحية اللازمة للوصول إلى هذه الصفحة.
                هذه المنطقة مخصصة لحسابات محددة (مزود نقل / إدارة المنصة).
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem' }}>
                    العودة للرئيسية
                </Link>
                <Link to="/profile" className="btn-primary" style={{ textDecoration: 'none', padding: '0.7rem 1.5rem' }}>
                    <LogIn size={18} /> ملفي الشخصي
                </Link>
            </div>
        </div>
    </div>
);
