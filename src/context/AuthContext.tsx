import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '../firebase/auth.ts';
import { getUserEnrolledCourses } from '../firebase/firestore.ts';

// ============================================================
// 🔐 HARDCODED ADMIN EMAIL — ONLY this email is ever admin
// No Firestore lookup needed — email check is the single source of truth
// ============================================================
const ADMIN_EMAILS = ['civilserviceskendra@gmail.com', 'admin@csk.com'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  isAuthenticated: boolean;
  enrolledCourses: string[];
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const courses = await getUserEnrolledCourses(currentUser.uid);
          setEnrolledCourses(courses);
        } catch {
          setEnrolledCourses([]);
        }
        // ✅ isAdmin is ONLY true if email exactly matches hardcoded admin email
        const adminCheck = ADMIN_EMAILS.includes(currentUser.email?.toLowerCase().trim() || '');
        setIsAdmin(adminCheck);
      } else {
        setEnrolledCourses([]);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
    enrolledCourses,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
