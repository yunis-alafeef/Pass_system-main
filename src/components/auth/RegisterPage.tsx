import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, Eye, EyeOff, User, UserPlus, Phone,
    AlertCircle, Building2, ShieldCheck, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Schema for Customer registration
const customerSchema = z.object({
    fullName: z.string().min(3, { message: 'الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل' }),
    email: z.string().email({ message: 'صيغة البريد الإلكتروني غير صحيحة' }),
    phone: z.string().regex(/^(\+967[0-9]{9}|\+966[0-9]{9})$/, { message: 'رقم الهاتف يجب أن يبدأ بـ +967 أو +966 ويليه 9 أرقام' }),
    password: z.string().min(8, { message: 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل' }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, { message: 'يجب الموافقة على الشروط والأحكام' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

// Schema for Vendor registration (FR-UI-001-02 والمهمة 2.10)
const vendorSchema = z.object({
    companyName: z.string().min(3, { message: 'اسم شركة / مكتب النقل مطلوب' }),
    commercialRecord: z.string().min(4, { message: 'رقم السجل التجاري / الترخيص مطلوب' }),
    contactPerson: z.string().min(3, { message: 'اسم ممثل المكتب / المدير المسؤول مطلوب' }),
    email: z.string().email({ message: 'البريد الإلكتروني للشركة غير صحيح' }),
    phone: z.string().regex(/^(\+967[0-9]{9}|\+966[0-9]{9})$/, { message: 'رقم الهاتف يجب أن يبدأ بـ +967 أو +966 ويليه 9 أرقام' }),
    fleetSize: z.number().min(1, { message: 'عدد الحافلات يجب أن يكون 1 على الأقل' }),
    routesType: z.enum(['internal', 'international', 'both']),
    password: z.string().min(8, { message: 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل' }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, { message: 'يجب الموافقة على اتفاقية المزودين' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
});

type CustomerFormValues = z.infer<typeof customerSchema>;
type VendorFormValues = z.infer<typeof vendorSchema>;

export const RegisterPage: React.FC = () => {
    const [accountType, setAccountType] = useState<'customer' | 'vendor'>('customer');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const { register: authRegister, registerVendor: authRegisterVendor } = useAuth();
    const navigate = useNavigate();

    // Customer Form
    const customerForm = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: { phone: '+967', acceptTerms: false },
    });

    // Vendor Form
    const vendorForm = useForm<VendorFormValues>({
        resolver: zodResolver(vendorSchema),
        defaultValues: { phone: '+967', fleetSize: 5, routesType: 'both', acceptTerms: false },
    });

    const watchedPassword = accountType === 'customer'
        ? customerForm.watch('password')
        : vendorForm.watch('password');

    // Password strength computation
    React.useEffect(() => {
        if (!watchedPassword) {
            setPasswordStrength(0);
            return;
        }
        let strength = 0;
        if (watchedPassword.length >= 8) strength += 25;
        if (/[A-Z]/.test(watchedPassword)) strength += 25;
        if (/[0-9]/.test(watchedPassword)) strength += 25;
        if (/[^A-Za-z0-9]/.test(watchedPassword)) strength += 25;
        setPasswordStrength(strength);
    }, [watchedPassword]);

    const onCustomerSubmit = async (data: CustomerFormValues) => {
        setIsLoading(true);
        setFormError(null);
        try {
            await authRegister({
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
            });
            navigate('/');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'تعذر إنشاء الحساب، حاول مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    const onVendorSubmit = async (data: VendorFormValues) => {
        setIsLoading(true);
        setFormError(null);
        try {
            await authRegisterVendor({
                companyName: data.companyName,
                commercialRecord: data.commercialRecord,
                contactPerson: data.contactPerson,
                email: data.email,
                phone: data.phone,
                password: data.password,
                fleetSize: data.fleetSize,
                routesType: data.routesType,
            });
            navigate('/vendor/dashboard');
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'تعذر تسجيل مكتب النقل، حاول مرة أخرى');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '2rem 1rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #00f5d4 0%, #3a86ff 100%)',
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 0 20px rgba(0, 245, 212, 0.4)'
                    }}>
                        <UserPlus size={26} color="#090d16" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>إنشاء حساب جديد</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>انضم إلى المنصة الرقمية الموحدة لنقل الركاب</p>
                </div>

                {/* Account Type Toggle (FR-UI-001-01 vs FR-UI-001-02) */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.35rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <button
                        type="button"
                        onClick={() => {
                            setAccountType('customer');
                            setFormError(null);
                        }}
                        style={{
                            flex: 1,
                            padding: '0.65rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: accountType === 'customer' ? 'var(--primary)' : 'transparent',
                            color: accountType === 'customer' ? '#fff' : '#94a3b8',
                            fontFamily: 'Cairo',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        <User size={16} /> حساب مسافر / عميل
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setAccountType('vendor');
                            setFormError(null);
                        }}
                        style={{
                            flex: 1,
                            padding: '0.65rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: accountType === 'vendor' ? 'var(--accent-purple)' : 'transparent',
                            color: accountType === 'vendor' ? '#fff' : '#94a3b8',
                            fontFamily: 'Cairo',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Building2 size={16} /> شركة / مكتب نقل
                    </button>
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

                {/* ================= Customer Registration ================= */}
                {accountType === 'customer' ? (
                    <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Full Name */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
                                الاسم الكامل
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                    <User size={18} />
                                </div>
                                <input
                                    {...customerForm.register('fullName')}
                                    type="text"
                                    placeholder="أدخل اسمك الثلاثي"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 2.5rem 0.75rem 0.9rem',
                                        backgroundColor: '#090d16',
                                        border: `1px solid ${customerForm.formState.errors.fullName ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.9rem',
                                        direction: 'rtl'
                                    }}
                                />
                            </div>
                            {customerForm.formState.errors.fullName && (
                                <p style={{ color: '#ff006e', fontSize: '0.76rem', marginTop: '0.3rem', fontWeight: 600 }}>{customerForm.formState.errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
                                البريد الإلكتروني
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    {...customerForm.register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 2.5rem 0.75rem 0.9rem',
                                        backgroundColor: '#090d16',
                                        border: `1px solid ${customerForm.formState.errors.email ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.9rem',
                                        direction: 'rtl'
                                    }}
                                />
                            </div>
                            {customerForm.formState.errors.email && (
                                <p style={{ color: '#ff006e', fontSize: '0.76rem', marginTop: '0.3rem', fontWeight: 600 }}>{customerForm.formState.errors.email.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
                                رقم الهاتف (اليمن +967 أو السعودية +966)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                                    <Phone size={18} />
                                </div>
                                <input
                                    {...customerForm.register('phone')}
                                    type="text"
                                    placeholder="+967771234567 أو +966501234567"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 2.5rem 0.75rem 0.9rem',
                                        backgroundColor: '#090d16',
                                        border: `1px solid ${customerForm.formState.errors.phone ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.9rem',
                                        direction: 'ltr',
                                        textAlign: 'right'
                                    }}
                                />
                            </div>
                            {customerForm.formState.errors.phone && (
                                <p style={{ color: '#ff006e', fontSize: '0.76rem', marginTop: '0.3rem', fontWeight: 600 }}>{customerForm.formState.errors.phone.message}</p>
                            )}
                        </div>

                        {/* Passwords */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    كلمة المرور
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        {...customerForm.register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="8 أحرف فأكثر"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.2rem',
                                            backgroundColor: '#090d16',
                                            border: `1px solid ${customerForm.formState.errors.password ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontFamily: 'Cairo',
                                            fontSize: '0.88rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    تأكيد كلمة المرور
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        {...customerForm.register('confirmPassword')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="تطابق الكلمة"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 0.75rem 0.75rem 2.2rem',
                                            backgroundColor: '#090d16',
                                            border: `1px solid ${customerForm.formState.errors.confirmPassword ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontFamily: 'Cairo',
                                            fontSize: '0.88rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Password strength indicator */}
                        {watchedPassword && (
                            <div style={{ marginTop: '-0.3rem' }}>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${passwordStrength}%`,
                                        background: passwordStrength < 50 ? '#ff006e' : passwordStrength < 100 ? '#ffbe0b' : '#00f5d4',
                                        transition: 'all 0.3s'
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '0.2rem' }}>
                                    قوة كلمة المرور: {passwordStrength < 50 ? 'ضعيفة' : passwordStrength < 100 ? 'متوسطة' : 'قوية جداً ✓'}
                                </span>
                            </div>
                        )}

                        {/* Terms */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <input
                                {...customerForm.register('acceptTerms')}
                                type="checkbox"
                                id="custTerms"
                                style={{ width: '16px', height: '16px', accentColor: '#3a86ff', cursor: 'pointer' }}
                            />
                            <label htmlFor="custTerms" style={{ fontSize: '0.82rem', color: '#94a3b8', cursor: 'pointer' }}>
                                أوافق على{' '}
                                <button
                                    type="button"
                                    onClick={() => setShowTermsModal(true)}
                                    style={{ background: 'none', border: 'none', color: '#3a86ff', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '0.82rem', padding: 0 }}
                                >
                                    شروط الخدمة وسياسة الخصوصية
                                </button>
                            </label>
                        </div>
                        {customerForm.formState.errors.acceptTerms && (
                            <p style={{ color: '#ff006e', fontSize: '0.76rem', fontWeight: 600 }}>{customerForm.formState.errors.acceptTerms.message}</p>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                            style={{ width: '100%', height: '46px', fontSize: '1rem', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب المسافر'}
                        </button>
                    </form>
                ) : (
                    /* ================= Transport Vendor Registration (FR-UI-001-02) ================= */
                    <form onSubmit={vendorForm.handleSubmit(onVendorSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        <div>
                            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                اسم شركة أو مكتب النقل
                            </label>
                            <input
                                {...vendorForm.register('companyName')}
                                type="text"
                                placeholder="مثال: شركة النجم السريع للنقل الدولي"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#090d16',
                                    border: `1px solid ${vendorForm.formState.errors.companyName ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.9rem'
                                }}
                            />
                            {vendorForm.formState.errors.companyName && (
                                <p style={{ color: '#ff006e', fontSize: '0.76rem', marginTop: '0.3rem' }}>{vendorForm.formState.errors.companyName.message}</p>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    رقم السجل التجاري / الترخيص
                                </label>
                                <input
                                    {...vendorForm.register('commercialRecord')}
                                    type="text"
                                    placeholder="س.ت: 4030123"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#090d16',
                                        border: `1px solid ${vendorForm.formState.errors.commercialRecord ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    اسم المسؤول / المدير
                                </label>
                                <input
                                    {...vendorForm.register('contactPerson')}
                                    type="text"
                                    placeholder="اسم الممثل"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#090d16',
                                        border: `1px solid ${vendorForm.formState.errors.contactPerson ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    عدد الحافلات (الأسطول)
                                </label>
                                <input
                                    {...vendorForm.register('fleetSize', { valueAsNumber: true })}
                                    type="number"
                                    min="1"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#090d16',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    نطاق الرحلات
                                </label>
                                <select
                                    {...vendorForm.register('routesType')}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#090d16',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <option value="both">داخلي ودولي (اليمن والسعودية)</option>
                                    <option value="internal">داخلي فقط (المحافظات اليمنية)</option>
                                    <option value="international">دولي فقط (اليمن ⇄ السعودية)</option>
                                </select>
                            </div>
                        </div>

                        {/* Email & Phone */}
                        <div>
                            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                البريد الإلكتروني المعتمد للمكتب
                            </label>
                            <input
                                {...vendorForm.register('email')}
                                type="email"
                                placeholder="vendor@company.com"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#090d16',
                                    border: `1px solid ${vendorForm.formState.errors.email ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                رقم هاتف الاتصال (+967 / +966)
                            </label>
                            <input
                                {...vendorForm.register('phone')}
                                type="text"
                                placeholder="+967771234567"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#090d16',
                                    border: `1px solid ${vendorForm.formState.errors.phone ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontFamily: 'Cairo',
                                    fontSize: '0.9rem',
                                    direction: 'ltr',
                                    textAlign: 'right'
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    كلمة المرور
                                </label>
                                <input
                                    {...vendorForm.register('password')}
                                    type="password"
                                    placeholder="8 أحرف فأكثر"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#090d16',
                                        border: `1px solid ${vendorForm.formState.errors.password ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.88rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    تأكيد كلمة المرور
                                </label>
                                <input
                                    {...vendorForm.register('confirmPassword')}
                                    type="password"
                                    placeholder="تأكيد الكلمة"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#090d16',
                                        border: `1px solid ${vendorForm.formState.errors.confirmPassword ? '#ff006e' : 'rgba(255,255,255,0.12)'}`,
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Cairo',
                                        fontSize: '0.88rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                            <input
                                {...vendorForm.register('acceptTerms')}
                                type="checkbox"
                                id="vendorTerms"
                                style={{ width: '16px', height: '16px', accentColor: '#8338ec', cursor: 'pointer' }}
                            />
                            <label htmlFor="vendorTerms" style={{ fontSize: '0.82rem', color: '#94a3b8', cursor: 'pointer' }}>
                                أوافق على اتفاقية تزويد خدمات النقل ولوائح المنصة
                            </label>
                        </div>
                        {vendorForm.formState.errors.acceptTerms && (
                            <p style={{ color: '#ff006e', fontSize: '0.76rem' }}>{vendorForm.formState.errors.acceptTerms.message}</p>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                height: '46px',
                                fontSize: '1rem',
                                marginTop: '0.4rem',
                                background: 'linear-gradient(135deg, #8338ec 0%, #3a86ff 100%)',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'جاري تسجيل المكتب...' : 'تسجيل المكتب والانتقال للوحة المزودين'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" style={{ color: '#3a86ff', fontWeight: 700, textDecoration: 'none' }}>
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>

            </div>

            {/* Terms & Conditions Modal (FR-UI-001-05) */}
            {showTermsModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 300,
                    background: 'rgba(5, 8, 15, 0.88)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '580px', maxHeight: '80vh', overflowY: 'auto', padding: '1.75rem', position: 'relative' }}>
                        <button
                            onClick={() => setShowTermsModal(false)}
                            className="btn-secondary"
                            style={{ position: 'absolute', left: '1rem', top: '1rem', padding: '0.4rem', borderRadius: '50%' }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#3a86ff', marginBottom: '1rem' }}>
                            <ShieldCheck size={26} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>شروط وأحكام منصة Pass System</h3>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <p><strong>1. نطاق المنصة:</strong> تتيح منصة Pass System حجز وإصدار التذاكر الإلكترونية لرحلات النقل البري الداخلي بين المحافظات اليمنية والنقل الدولي بين اليمن والمملكة العربية السعودية.</p>
                            <p><strong>2. مسؤولية التذاكر:</strong> الحجز مؤكد بمجرد استلام رمز الحجز والتذكرة الرقمية مع رمز QR. يجب على المسافر التواجد في محطة الانطلاق قبل موعد الرحلة بساعة واحدة على الأقل.</p>
                            <p><strong>3. سياسة الإلغاء والاسترداد:</strong> يمكن إلغاء الحجز قبل 6 ساعات على الأقل من موعد الرحلة وفقاً لضوابط مكتب النقل المشغل.</p>
                            <p><strong>4. خصوصية البيانات:</strong> تلتزم المنصة بتشفير بيانات المستخدمين والاتصالات بمعايير TLS 1.3 وعدم مشاركتها مع أي جهة غير مصرح لها.</p>
                        </div>

                        <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="btn-primary"
                                style={{ padding: '0.6rem 1.4rem' }}
                            >
                                قرأت وأوافق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
