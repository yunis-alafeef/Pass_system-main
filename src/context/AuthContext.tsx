/**
 * AuthContext.tsx
 * سياق المصادقة العام — يوفر حالة المستخدم والدوال لكل التطبيق
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    tokenStore,
    login as svcLogin,
    register as svcRegister,
    registerVendor as svcRegisterVendor,
    logout as svcLogout,
    updateProfile as svcUpdateProfile,
    type User,
    type UserRole,
    type RegisterPayload,
    type VendorRegisterPayload,
} from '../services/authService';

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    role: UserRole | null;
    login: (identifier: string, password: string, rememberMe: boolean) => Promise<User>;
    /** إنشاء حساب جديد — يُسجّل الدخول تلقائياً عند نجاح الخلفية */
    register: (payload: RegisterPayload) => Promise<User>;
    registerVendor: (payload: VendorRegisterPayload) => Promise<User>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<Pick<User, 'fullName' | 'phone' | 'avatar'>>) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(tokenStore.user);

    const login = useCallback(async (identifier: string, password: string, rememberMe: boolean) => {
        const res = await svcLogin(identifier, password, rememberMe);
        setUser(res.user);
        return res.user;
    }, []);

    const register = useCallback(async (payload: RegisterPayload) => {
        const res = await svcRegister(payload);
        setUser(res.user);
        return res.user;
    }, []);

    const registerVendor = useCallback(async (payload: VendorRegisterPayload) => {
        const res = await svcRegisterVendor(payload);
        setUser(res.user);
        return res.user;
    }, []);

    const logout = useCallback(async () => {
        await svcLogout();
        setUser(null);
    }, []);

    const updateUser = useCallback(async (data: Partial<Pick<User, 'fullName' | 'phone' | 'avatar'>>) => {
        const updated = await svcUpdateProfile(data);
        setUser(updated);
        return updated;
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                role: user?.role ?? null,
                login,
                register,
                registerVendor,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};