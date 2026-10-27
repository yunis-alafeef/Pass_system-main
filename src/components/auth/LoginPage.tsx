import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, X,
    CheckCircle2, KeyRound, ShieldAlert, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { forgotPassword, resetPasswordWithToken } from '../../services/authService';

const loginSchema = z.object({
    identifier: z.string().min(3, { message: 'البريد الإلكتروني أو رقم الهاتف مطلوب' }),
    password: z.string().min(6, { message: 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل' }),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // حالة استرداد كلمة المرور (FR-UI-003-03)
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
    const [forgotIdentifier, setForgotIdentifier] = useState('');
    const [forgotCode, setForgotCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [forgotError, setForgotError] = useState<string | null>(null);
    const [forgotLoading, setForgotLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { rememberMe: true },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setFormError(null);
        try {
            await login(data.identifier, data.password, !!data.rememberMe);
            navigate('/');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع، حاول مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendResetCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotIdentifier.trim()) {
            setForgotError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل');
            return;
        }
        setForgotLoading(true);
        setForgotError(null);
        try {
            await forgotPassword(forgotIdentifier);
            setForgotCode('1234'); // كود تجريبي للعرض
            setForgotStep(2);
        } catch (err) {
            setForgotError(err instanceof Error ? err.message : 'تعذر إرسال رمز الاستعادة');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleConfirmReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            setForgotError('كلمة المرور الجديدة يجب أن تتكون من 8 أحرف على الأقل');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setForgotError('كلمات المرور غير متطابقة');
            return;
        }
        setForgotLoading(true);
        setForgotError(null);
        try {
            await resetPasswordWithToken(forgotIdentifier, forgotCode, newPassword);
            setForgotStep(3);
        } catch (err) {
            setForgotError(err instanceof Error ? err.message : 'فشلت عملية إعادة التعيين');
        } finally {
            setForgotLoading(false);
        }
    };

    const fillDemoCredentials = (email: string, pass: string) => {
        setValue('identifier', email, { shouldValidate: true });
        setValue('password', pass, { shouldValidate: true });
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '1.5rem 1rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #3a86ff 0%, #00f5d4 100%)',
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 0 20px rgba(58, 134, 255, 0.4)'
                    }}>
                        <LogIn size={26} color="#090d16" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>تسجيل الدخول</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>أهلاً بك في منصة Pass System لإدارة النقل والحجوزات</p>
                </div>

                {/* Error Banner */}
                {formError && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        background: 'rgba(255, 0, 110, 0.1)',
                        border: '1px solid rgba(255, 0, 110, 0.35)',
                        borderRadius: '12px',
                        padding: '0.75rem 0.9rem',
                        marginBottom: '1.25rem',
                        color: '#ff006e',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                    }} className="animate-fade-in">
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{formError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                    {/* Email / Phone Field */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                            البريد الإلكتروني أو رقم الهاتف
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                <Mail size={18} />
                            </div>
                            <input
                                {...register('identifier')}
                                type="text"
                                placeholder="أدخل بريدك أو هاتفك (+967 / +966)"
                                className="form-control"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 2.5rem 0.75rem 0.9rem',
                                    backgroundColor: '#090d16',
                                    border: `1px solid ${errors.identifier ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.92rem',
                                    outline: 'none',
                                    direction: 'rtl'
                                }}
                            />
                        </div>
                        {errors.identifier && (
                            <p style={{ color: '#ff006e', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>{errors.identifier.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                            كلمة المرور
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="أدخل كلمة المرور"
                                className="form-control"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                                    backgroundColor: '#090d16',
                                    border: `1px solid ${errors.password ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.92rem',
                                    outline: 'none',
                                    direction: 'rtl'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    left: '0.9rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 0
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p style={{ color: '#ff006e', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>{errors.password.message}</p>
                        )}
                    </div>

                    {/* Remember & Forgot */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: '#94a3b8', fontSize: '0.82rem' }}>
                            <input
                                {...register('rememberMe')}
                                type="checkbox"
                                style={{ width: '16px', height: '16px', accentColor: '#3a86ff', cursor: 'pointer' }}
                            />
                            تذكرني
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                setForgotStep(1);
                                setForgotError(null);
                                setShowForgotModal(true);
                            }}
                            style={{ background: 'none', border: 'none', color: '#3a86ff', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'Cairo' }}
                        >
                            نسيت كلمة المرور؟
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{ width: '100%', height: '46px', fontSize: '1rem', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'جاري التحقق...' : (
                            <>
                                <LogIn size={18} /> تسجيل الدخول
                            </>
                        )}
                    </button>
                </form>

                {/* Quick Demo Credentials */}
                <div style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    color: '#94a3b8'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: '#00f5d4', fontWeight: 700 }}>
                        <Sparkles size={14} /> بيانات الدخول التجريبية الجاهزة:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <button
                            type="button"
                            onClick={() => fillDemoCredentials('yaqoub@example.com', 'Test@1234')}
                            style={{
                                background: 'rgba(58, 134, 255, 0.1)',
                                border: '1px solid rgba(58, 134, 255, 0.25)',
                                color: '#93c5fd',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'right',
                                fontFamily: 'Cairo',
                                fontSize: '0.76rem'
                            }}
                        >
                            👤 حساب عميل: yaqoub@example.com (انقر للتعبئة)
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                        لا تملك حساباً بعد؟{' '}
                        <Link to="/register" style={{ color: '#00f5d4', fontWeight: 700, textDecoration: 'none' }}>
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </div>

            </div>

            {/* Forgot Password Modal (FR-UI-003-03) */}
            {showForgotModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 250,
                    background: 'rgba(5, 8, 15, 0.88)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', position: 'relative' }}>
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="btn-secondary"
                            style={{ position: 'absolute', left: '1rem', top: '1rem', padding: '0.4rem', borderRadius: '50%' }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '14px',
                                background: 'rgba(58, 134, 255, 0.15)',
                                color: '#3a86ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.75rem',
                            }}>
                                <KeyRound size={22} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>استرداد كلمة المرور</h3>
                            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                {forgotStep === 1 && 'أدخل بريدك أو رقم هاتفك لتلقي رمز الاستعادة'}
                                {forgotStep === 2 && 'أدخل رمز التحقق وكلمة المرور الجديدة'}
                                {forgotStep === 3 && 'تم تغيير كلمة المرور بنجاح!'}
                            </p>
                        </div>

                        {forgotError && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'rgba(255, 0, 110, 0.1)',
                                border: '1px solid rgba(255, 0, 110, 0.3)',
                                borderRadius: '10px',
                                padding: '0.65rem 0.85rem',
                                marginBottom: '1rem',
                                color: '#ff006e',
                                fontSize: '0.82rem',
                            }}>
                                <ShieldAlert size={16} />
                                <span>{forgotError}</span>
                            </div>
                        )}

                        {forgotStep === 1 && (
                            <form onSubmit={handleSendResetCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                        البريد أو الهاتف المسجل
                                    </label>
                                    <input
                                        type="text"
                                        value={forgotIdentifier}
                                        onChange={(e) => setForgotIdentifier(e.target.value)}
                                        placeholder="مثال: yaqoub@example.com أو +967771234567"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            backgroundColor: '#090d16',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '10px',
                                            color: '#fff',
                                            fontFamily: 'Cairo',
                                            fontSize: '0.9rem',
                                            direction: 'rtl',
                                        }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={forgotLoading} style={{ height: '44px', width: '100%' }}>
                                    {forgotLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                                </button>
                            </form>
                        )}

                        {forgotStep === 2 && (
                            <form onSubmit={handleConfirmReset} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                        رمز التحقق المستلم (تجريبي: 1234)
                                    </label>
                                    <input
                                        type="text"
                                        value={forgotCode}
                                        onChange={(e) => setForgotCode(e.target.value)}
                                        placeholder="أدخل الرمز"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            backgroundColor: '#090d16',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '10px',
                                            color: '#fff',
                                            fontFamily: 'Cairo',
                                            fontSize: '0.9rem',
                                            textAlign: 'center',
                                            letterSpacing: '4px',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                        كلمة المرور الجديدة
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="8 أحرف على الأقل"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            backgroundColor: '#090d16',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '10px',
                                            color: '#fff',
                                            fontFamily: 'Cairo',
                                            fontSize: '0.9rem',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                        تأكيد كلمة المرور
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="أعد إدخال كلمة المرور"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            backgroundColor: '#090d16',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: '10px',
                                            color: '#fff',
                                            fontFamily: 'Cairo',
                                            fontSize: '0.9rem',
                                        }}
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={forgotLoading} style={{ height: '44px', width: '100%', marginTop: '0.5rem' }}>
                                    {forgotLoading ? 'جاري الحفظ...' : 'تأكيد كلمة المرور الجديدة'}
                                </button>
                            </form>
                        )}

                        {forgotStep === 3 && (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <CheckCircle2 size={48} color="#00f5d4" style={{ margin: '0 auto 0.75rem' }} />
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>تم التعيين بنجاح</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                    تم فك قفل الحساب وتحديث كلمة المرور. يمكنك الآن تسجيل الدخول بها.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowForgotModal(false);
                                        setValue('identifier', forgotIdentifier);
                                    }}
                                    className="btn-primary"
                                    style={{ width: '100%', height: '44px' }}
                                >
                                    العودة لتسجيل الدخول
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
