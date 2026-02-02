import { create } from 'zustand';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  avatar?: string | null;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  consultationFee?: number | null;
  affiliation?: string | null;
  yearsOfExperience?: number | null;
  clinicAddress?: string | null;
  clinicContactPerson?: string | null;
  clinicPhone?: string | null;
  licenseDocument?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isOAuth: boolean;
  isTwoFactorEnabled?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  authChecked: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setBootstrapping: (isBootstrapping: boolean) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

let authCheckPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,
  authChecked: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setBootstrapping: (isBootstrapping) => {
    set({ isBootstrapping });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {

    }
    
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isBootstrapping: false,
      authChecked: true,
    });
  },

  checkAuth: async () => {
    if (authCheckPromise) {
      return authCheckPromise;
    }

    authCheckPromise = (async () => {
      try {
        set({ isLoading: true });
        
        const response = await api.get('/auth/me');
        
        if (response.status === 304) {
          const currentUser = get().user;
          set({ user: currentUser, isAuthenticated: !!currentUser, isBootstrapping: false });
          return;
        }

        const userData = response.data;
        set({ user: userData, isAuthenticated: true, isBootstrapping: false });
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          set({ user: null, isAuthenticated: false, isBootstrapping: false });
        } else {
          const currentUser = get().user;
          set({ user: currentUser, isAuthenticated: !!currentUser, isBootstrapping: false });
        }
      } finally {
        set({ isLoading: false, authChecked: true });
        authCheckPromise = null;
      }
    })();

    return authCheckPromise;
  },

  initializeAuth: async () => {
    await get().checkAuth();
  },
}));