import React, { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUserAdmin } from '../firebase/firestore';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * ADMIN ROUTE - Only allows admin users
 * If user is not logged in or not admin, redirects to /login
 * 
 * Usage in App.tsx:
 * <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      }
      setChecking(false);
    };

    checkAdmin();
  }, [user]);

  // Show loading spinner while checking auth and admin status
  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is admin, show the page
  return <>{children}</>;
};
