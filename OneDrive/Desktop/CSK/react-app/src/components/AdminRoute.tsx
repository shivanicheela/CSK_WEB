import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================
// 🔐 Must match AuthContext.tsx and Login.tsx ADMIN_EMAIL
// ============================================================
const ADMIN_EMAILS = ['civilserviceskendra@gmail.com', 'admin@csk.com'];

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const emailMatch = ADMIN_EMAILS.includes(user.email?.toLowerCase().trim() || '');

  if (!isAdmin || !emailMatch) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
