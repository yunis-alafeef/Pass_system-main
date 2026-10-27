import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

    const {
        register,
        handleSubmit,
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

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)', padding: '2rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #3a86ff 0%, #00f5d4 100%)',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                        boxShadow: '0 0 20px rgba(58, 134, 255, 0.4)'
                    }}>
                        <LogIn size={28} color="#090d16" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>تسجيل الدخول</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>أهلاً بك مجدداً في نظام Pass System الذكي</p>
                </div>

                {formError && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        background: 'rgba(255, 0, 110, 0.08)',
                        border: '1px solid rgba(255, 0, 110, 0.3)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1.25rem',
                        color: '#ff006e',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                    }} className="animate-fade-in">
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Email / Phone Field */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                            البريد الإلكتروني أو رقم الهاتف
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                <Mail size={18} />
                            </div>
                            <input
                                {...register('identifier')}
                                type="text"
                                placeholder="أدخل بريدك الإلكتروني أو رقمك"
                                className="form-control"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem 0.8rem 2.8rem', // padding-right for icon
                                    backgroundColor: '#090d16',
                                    border: `1px solid ${errors.identifier ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    direction: 'rtl'
                                }}
                            />
                        </div>
                        {errors.identifier && (
                            <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.identifier.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>
                            كلمة المرور
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="أدخل كلمة المرور"
                                className="form-control"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 2.8rem 0.8rem 1rem', // right padding for lock, left for eye
                                    backgroundColor: '#090d16',
                                    border: `1px solid ${errors.password ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    direction: 'rtl'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
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
                            <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.password.message}</p>
                        )}
                    </div>

                    {/* Remember & Forgot */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}>
                            <input
                                {...register('rememberMe')}
                                type="checkbox"
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    accentColor: '#3a86ff',
                                    cursor: 'pointer'
                                }}
                            />
                            تذكرني
                        </label>
                        <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ color: '#3a86ff', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                            نسيت كلمة المرور؟
                        </a>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{ width: '100%', height: '48px', fontSize: '1.05rem', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'جاري التحقق...' : (
                            <>
                                <LogIn size={20} /> تسجيل الدخول
                            </>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        لا تملك حساباً بعد؟{' '}
                        <Link to="/register" style={{ color: '#00f5d4', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};
