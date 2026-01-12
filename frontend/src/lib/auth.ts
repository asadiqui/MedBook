import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  avatar: string | null;
  phone?: string;
  specialty?: string;
  bio?: string;
  consultationFee?: number;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isVerified?: boolean;
  isTwoFactorEnabled?: boolean;
  gender?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  affiliation?: string;
  yearsOfExperience?: number;
  clinicAddress?: string;
  clinicContactPerson?: string;
  clinicPhone?: string;
  licenseDocument?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'PATIENT' | 'DOCTOR';
  phone?: string;
  dateOfBirth?: string;
  // Doctor-specific fields
  specialty?: string;
  licenseNumber?: string;
  affiliation?: string;
  yearsOfExperience?: number;
  clinicAddress?: string;
  clinicContactPerson?: string;
  clinicPhone?: string;
  bio?: string;
  consultationFee?: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true until hydrated
      error: null,

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, tokens } = response.data;

          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', data);
          const { user, tokens } = response.data;

          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchUser: async () => {
        // Wait for client-side hydration
        if (typeof window === 'undefined') return;
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // Only clear tokens if it's a 401 error
          const axiosError = error as any;
          if (axiosError.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            // Network error or other issue - keep the persisted state
            set({ isLoading: false });
          }
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // When storage is rehydrated, set loading to false
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
