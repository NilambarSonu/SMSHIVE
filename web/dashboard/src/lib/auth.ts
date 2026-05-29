// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — Auth Store (Zustand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { create } from 'zustand';
import { api } from './api';

interface User {
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
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await api.post<{ success: boolean; data: { accessToken: string; refreshToken: string; user: User } }>(
      '/api/auth/login',
      { email, password }
    );
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('smshive_access_token', accessToken);
    localStorage.setItem('smshive_refresh_token', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post<{ success: boolean; data: { accessToken: string; refreshToken: string; user: User } }>(
      '/api/auth/register',
      { name, email, password }
    );
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('smshive_access_token', accessToken);
    localStorage.setItem('smshive_refresh_token', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('smshive_access_token');
    localStorage.removeItem('smshive_refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = '/login';
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('smshive_access_token');
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const response = await api.get<{ success: boolean; data: User }>('/api/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));
