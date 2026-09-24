import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Phone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z.object({
    fullName: z.string().min(3, { message: 'الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل' }),
    email: z.string().email({ message: 'صيغة البريد الإلكتروني غير صحيحة' }),
    phone: z.string().regex(/^\+967[0-9]{9}$/, { message: 'رقم الهاتف يجب أن يبدأ بـ +967 ويليه 9 أرقام' }),
    password: z.string().min(8, { message: 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل' }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, { message: 'يجب الموافقة على الشروط والأحكام' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'otp'>('form');
    // خطأ من الخلفية (بريد/هاتف مكرر...) — يظهر في أعلى النموذج
    const [formError, setFormError] = useState<string | null>(null);
    // بيانات التسجيل الحالية (لتمريرها لخطوة OTP إن لزمت لاحقاً)
    const [pendingData, setPendingData] = useState<RegisterFormValues | null>(null);

    const { register: authRegister } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            phone: '+967',
        }
    });

    const passwordVal = watch('password');

    // React to password changes to calculate strength
    React.useEffect(() => {
        if (!passwordVal) {
            setPasswordStrength(0);
            return;
        }
        let strength = 0;
        if (passwordVal.length >= 8) strength += 25;
        if (/[A-Z]/.test(passwordVal)) strength += 25;
        if (/[0-9]/.test(passwordVal)) strength += 25;
        if (/[^A-Za-z0-9]/.test(passwordVal)) strength += 25;
        setPasswordStrength(strength);
    }, [passwordVal]);

    /**
     * إرسال التسجيل إلى الخلفية (POST /auth/register → يمر عبر AuthContext)
     * === درس: "النجاح" يعني أن الخادم قبل التسجيل ===
     * لا ننتقل لخطوة OTP لأن الخلفية تنشئ الحساب مباشرة وتُرجع توكنات دخول،
     * فنحوّل المستخدم للصفحة الرئيسية مسجلاً للدخول. عند إضافة /auth/otp مستقبلاً
     * نعيد تفعيل خطوة OTP في هذا المكان (stageRegistration + setStep('otp')).
     */
    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        setFormError(null);
        try {
            await authRegister({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
            });
            setPendingData(data);
            navigate('/');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'تعذر إنشاء الحساب، حاول مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert('تم التحقق بنجاح! تم إنشاء الحساب.');
        }, 1500);
    };

    // نحتفظ بمرجع البيانات المستخدمة لتفادي تحذير المتغير غير المستخدم
    void pendingData;

    const getStrengthColor = () => {
        if (passwordStrength < 50) return '#ff006e';
        if (passwordStrength < 100) return '#ffbe0b';
        return '#00f5d4';
    };
    const getStrengthText = () => {
        if (passwordStrength < 50) return 'ضعيفة';
        if (passwordStrength < 100) return 'متوسطة';
        return 'قوية';
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)', padding: '2rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>

                {step === 'form' ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #00f5d4 0%, #3a86ff 100%)',
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                                boxShadow: '0 0 20px rgba(0, 245, 212, 0.3)'
                            }}>
                                <User size={28} color="#090d16" strokeWidth={2.5} />
                            </div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>إنشاء حساب جديد</h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>انضم إلى شبكة النقل الأكبر وابدأ رحلتك بسهولة</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* خطأ من الخادم (بريد/هاتف مسجل مسبقاً...) */}
                            {formError && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    background: 'rgba(255, 0, 110, 0.08)', border: '1px solid rgba(255, 0, 110, 0.3)',
                                    borderRadius: '12px', padding: '0.85rem 1rem', color: '#ff006e',
                                    fontSize: '0.88rem', fontWeight: 600,
                                }} className="animate-fade-in">
                                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                                    {formError}
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>الاسم الكامل</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                        <User size={18} />
                                    </div>
                                    <input
                                        {...register('fullName')}
                                        type="text"
                                        placeholder="الاسم الرباعي كما في الهوية"
                                        style={{
                                            width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', backgroundColor: '#090d16',
                                            border: `1px solid ${errors.fullName ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                            borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none'
                                        }}
                                    />
                                </div>
                                {errors.fullName && <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.fullName.message}</p>}
                            </div>

                            {/* Email & Phone Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>البريد الإلكتروني</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            {...register('email')}
                                            type="email"
                                            placeholder="example@mail.com"
                                            style={{
                                                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', backgroundColor: '#090d16',
                                                border: `1px solid ${errors.email ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                                borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none', direction: 'ltr', textAlign: 'right'
                                            }}
                                        />
                                    </div>
                                    {errors.email && <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>رقم الهاتف</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            {...register('phone')}
                                            type="text"
                                            dir="ltr"
                                            style={{
                                                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', backgroundColor: '#090d16',
                                                border: `1px solid ${errors.phone ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                                borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '1rem', outline: 'none', textAlign: 'right'
                                            }}
                                        />
                                    </div>
                                    {errors.phone && <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.phone.message}</p>}
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>كلمة المرور</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="8 أحرف كحد أدنى"
                                        style={{
                                            width: '100%', padding: '0.8rem 2.8rem 0.8rem 1rem', backgroundColor: '#090d16',
                                            border: `1px solid ${errors.password ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                            borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none'
                                        }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {passwordVal && passwordVal.length > 0 && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                                            {[25, 50, 75, 100].map(val => (
                                                <div key={val} style={{ flex: 1, borderRadius: '2px', backgroundColor: passwordStrength >= val ? getStrengthColor() : 'rgba(255,255,255,0.1)', transition: 'background-color 0.3s' }} />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: getStrengthColor() }}> قوة كلمة المرور: {getStrengthText()}</span>
                                    </div>
                                )}
                                {errors.password && <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.password.message}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>تأكيد كلمة المرور</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <input
                                        {...register('confirmPassword')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="أعد إدخال كلمة المرور"
                                        style={{
                                            width: '100%', padding: '0.8rem 2.8rem 0.8rem 1rem', backgroundColor: '#090d16',
                                            border: `1px solid ${errors.confirmPassword ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                            borderRadius: '12px', color: '#fff', fontFamily: 'Cairo', fontSize: '0.95rem', outline: 'none'
                                        }}
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.confirmPassword.message}</p>}
                            </div>

                            {/* Terms Checkbox */}
                            <div style={{ marginTop: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <input
                                        {...register('acceptTerms')}
                                        type="checkbox"
                                        style={{ width: '18px', height: '18px', accentColor: '#3a86ff', cursor: 'pointer' }}
                                    />
                                    أوافق على <a href="#terms" style={{ color: '#3a86ff', textDecoration: 'none', fontWeight: 600 }}>الشروط والأحكام</a> و <a href="#privacy" style={{ color: '#3a86ff', textDecoration: 'none', fontWeight: 600 }}>سياسة الخصوصية</a>
                                </label>
                                {errors.acceptTerms && <p style={{ color: '#ff006e', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>{errors.acceptTerms.message}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isLoading}
                                style={{ width: '100%', height: '48px', fontSize: '1.05rem', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? 'جاري المعالجة...' : (
                                    <>
                                        <UserPlus size={20} /> إنشاء الحساب
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                لديك حساب بالفعل؟{' '}
                                <Link to="/login" style={{ color: '#ffbe0b', fontWeight: 700, textDecoration: 'none' }}>
                                    تسجيل الدخول
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    /* OTP Verification Step */
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                background: 'rgba(255, 190, 11, 0.1)',
                                border: '1px solid rgba(255, 190, 11, 0.3)',
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                            }}>
                                <Phone size={32} color="#ffbe0b" strokeWidth={2} />
                            </div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>تحقق من رقم هاتفك</h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                لقد أرسلنا رمز تحقق (OTP) مكون من 4 أرقام إلى رقمك
                            </p>
                        </div>

                        <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', direction: 'ltr' }}>
                                {[1, 2, 3, 4].map(idx => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={1}
                                        required
                                        style={{
                                            width: '54px', height: '64px', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center',
                                            backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
                                            color: '#00f5d4', outline: 'none'
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isLoading}
                                style={{ width: '100%', height: '48px', fontSize: '1.05rem', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#3a86ff', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
                            >
                                <AlertCircle size={16} /> إعادة إرسال الرمز
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '1rem auto 0 auto' }}
                            >
                                <ArrowRight size={14} /> تعديل رقم الهاتف
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
