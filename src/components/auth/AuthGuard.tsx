import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: ('customer' | 'vendor' | 'admin')[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem('access_token');

    // For development/UI preview purposes: Skip enforcement if no token exists yet
    // In production, uncomment the following lines to enforce authentication:

    /*
    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Role Check logic here (decode JWT and check roles)
    */

    return <>{children}</>;
};
