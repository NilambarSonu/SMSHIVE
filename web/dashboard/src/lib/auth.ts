// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — Auth Utilities (Clerk-powered)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useCallback } from 'react';
import { api } from './api';

/**
 * Hook to initialize the API client with Clerk's token getter.
 * Call this once in a layout or provider component.
 */
export function useApiAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    api.setTokenGetter(getToken);
  }, [getToken]);
}

/**
 * Hook that provides user information from Clerk.
 * Replaces the old Zustand auth store.
 */
export function useAuthUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();

  const logout = useCallback(async () => {
    await signOut();
    window.location.href = '/sign-in';
  }, [signOut]);

  return {
    user: isLoaded && isSignedIn && user
      ? {
          _id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User',
          avatar: user.imageUrl || undefined,
          role: 'operator' as const,
          preferences: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            smsDelay: 0,
            theme: 'system',
            notifications: {
              emailOnFailure: true,
              emailOnDeviceOffline: true,
              emailDailySummary: false,
            },
          },
        }
      : null,
    isLoading: !isLoaded,
    isAuthenticated: isLoaded && isSignedIn === true,
    logout,
  };
}

/**
 * Hook to sync the Clerk user with the backend MongoDB database.
 * Call this in the dashboard layout so the backend has a user record.
 */
export function useSyncUser() {
  const { getToken } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const syncWithBackend = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Silent fail — backend might not be running in dev
        console.debug('[SMSHIVE] Backend user sync skipped (API may be offline)');
      }
    };

    syncWithBackend();
  }, [isLoaded, isSignedIn, user, getToken]);
}

// ── Legacy compatibility ──────────────────
// Some components may still import useAuthStore.
// Provide a compatibility shim that maps to Clerk hooks.
import { create } from 'zustand';

interface LegacyUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  preferences: {
    timezone: string;
    defaultDeviceId?: string;
    smsDelay: number;
    theme: string;
    notifications: {
      emailOnFailure: boolean;
      emailOnDeviceOffline: boolean;
      emailDailySummary: boolean;
    };
  };
}

interface AuthState {
  user: LegacyUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<LegacyUser>) => void;
}

/**
 * @deprecated Use useAuthUser() and useApiAuth() instead.
 * This store is kept only for backward compatibility during migration.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async () => {
    // Auth is now handled by Clerk — redirect to sign-in page
    window.location.href = '/sign-in';
  },

  register: async () => {
    // Auth is now handled by Clerk — redirect to sign-up page
    window.location.href = '/sign-up';
  },

  logout: () => {
    window.location.href = '/sign-in';
  },

  fetchUser: async () => {
    // No-op — user data comes from Clerk hooks now
    set({ isLoading: false });
  },

  updateUser: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));
