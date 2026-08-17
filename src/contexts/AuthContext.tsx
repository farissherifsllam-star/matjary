import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, UserRole } from '../types';
import { auth, AuthSession } from '../lib/auth';
import { db } from '../lib/database';

export interface AuthContextType {
  session: AuthSession | null;
  user: AuthSession['user'] | null;
  profile: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isMerchant: boolean;
  requestOtp: (phoneOrEmail: string, isSignup?: boolean, role?: UserRole) => { success: boolean; demoCode: string; message: string };
  verifyOtp: (code: string, fullName?: string, role?: UserRole) => boolean;
  loginAs: (role: 'super_admin' | 'merchant' | 'new_merchant') => void;
  logout: () => void;
  refreshProfile: () => void;
  updateProfile: (updates: Partial<Profile>) => Profile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => auth.getSession());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Subscribe to AuthService changes
  useEffect(() => {
    // Initial fetch to sync profile
    const current = auth.getSession();
    if (current?.user.id) {
      const freshProfile = db.getProfileById(current.user.id);
      if (freshProfile) {
        setSession({
          user: current.user,
          profile: freshProfile,
        });
      } else {
        setSession(current);
      }
    } else {
      setSession(current);
    }
    setIsLoading(false);

    const unsubscribe = auth.subscribe((newSession) => {
      setSession(newSession);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = useCallback(() => {
    if (session?.user.id) {
      const freshProfile = db.getProfileById(session.user.id);
      if (freshProfile) {
        setSession({
          user: session.user,
          profile: freshProfile,
        });
      }
    }
  }, [session]);

  const updateProfile = useCallback((updates: Partial<Profile>): Profile | null => {
    if (!session?.user.id) return null;
    const updated = db.updateProfile(session.user.id, updates);
    if (updated) {
      setSession((prev) => (prev ? { ...prev, profile: updated } : null));
    }
    return updated;
  }, [session]);

  const requestOtp = useCallback((phoneOrEmail: string, isSignup = false, role: UserRole = 'merchant') => {
    return auth.requestOtp(phoneOrEmail, isSignup, role);
  }, []);

  const verifyOtp = useCallback((code: string, fullName?: string, role: UserRole = 'merchant') => {
    const success = auth.verifyOtp(code, fullName, role);
    if (success) {
      setSession(auth.getSession());
    }
    return success;
  }, []);

  const loginAs = useCallback((role: 'super_admin' | 'merchant' | 'new_merchant') => {
    auth.loginAs(role);
    setSession(auth.getSession());
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setSession(null);
  }, []);

  const user = session?.user || null;
  const profile = session?.profile || null;
  const role = profile?.role || null;
  const isAuthenticated = Boolean(session && user);
  const isSuperAdmin = role === 'super_admin';
  const isMerchant = role === 'merchant' || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isAuthenticated,
        isLoading,
        isSuperAdmin,
        isMerchant,
        requestOtp,
        verifyOtp,
        loginAs,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
