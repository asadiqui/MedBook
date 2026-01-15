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
  isOAuth?: boolean;
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
  success: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  clearSuccess: () => void;
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
  licenseDocument?: File;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      success: null,

      clearError: () => set({ error: null }),

      clearSuccess: () => set({ success: null }),

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

      register: async (data: RegisterData & { licenseDocument?: File }) => {
        set({ isLoading: true, error: null });
        try {
          // Create FormData for file upload
          const formData = new FormData();
          
          // Add all text fields
          Object.entries(data).forEach(([key, value]) => {
            if (key === 'licenseDocument') {
              // Handle file separately
              if (value instanceof File) {
                formData.append('licenseDocument', value);
              }
            } else if (value !== undefined && value !== null) {
              formData.append(key, value.toString());
            }
          });

          const response = await api.post('/auth/register', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          const { user, tokens, message } = response.data;

          // Only set tokens and authenticate if they exist
          if (tokens) {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            // Registration successful but no tokens (email verification required)
            set({ user: null, isAuthenticated: false, isLoading: false });
          }

          // Store the message for display
          if (message) {
            set({ success: message }); // Using success field to display success message
          }

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
    }
  )
);
