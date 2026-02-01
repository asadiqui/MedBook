import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  isVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  isBootstrapping: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setBootstrapping: (isBootstrapping: boolean) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// Create the store with proper SSR handling
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      isBootstrapping: true,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }
        // Don't automatically check auth here to avoid race conditions
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },

      setBootstrapping: (isBootstrapping) => {
        set({ isBootstrapping });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        let { accessToken, refreshToken } = get();

        if (!accessToken) {
          const storedAccessToken = localStorage.getItem('accessToken');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          if (storedAccessToken) {
            get().setTokens(storedAccessToken, storedRefreshToken);
            accessToken = storedAccessToken;
            refreshToken = storedRefreshToken;
          }
        }

        if (!accessToken) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          let tokenExpired = false;
          try {
            const base64Url = accessToken.split('.')[1] || '';
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
            const payload = JSON.parse(atob(padded));
            const currentTime = Date.now() / 1000;
            tokenExpired = payload.exp && payload.exp < currentTime;
          } catch (error) {
            // If parsing fails, fall back to server validation
            tokenExpired = false;
          }

          const refreshAccessToken = async () => {
            const refresh = refreshToken || localStorage.getItem('refreshToken');
            if (!refresh) return null;
            const response = await fetch(`${API_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: refresh }),
            });
            if (!response.ok) return null;
            const data = await response.json();
            if (data?.accessToken && data?.refreshToken) {
              get().setTokens(data.accessToken, data.refreshToken);
              return data.accessToken as string;
            }
            return null;
          };

          if (tokenExpired) {
            const refreshedToken = await refreshAccessToken();
            if (!refreshedToken) {
              get().logout();
              return;
            }
            accessToken = refreshedToken;
          }

          // Only fetch user data if we don't have it
          if (!get().user) {
            set({ isLoading: true });
            try {
              const response = await fetch(
                `${API_URL}/auth/me`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (response.ok) {
                const userData = await response.json();
                get().setUser(userData);
              } else if (response.status === 401) {
                const refreshedToken = await refreshAccessToken();
                if (refreshedToken) {
                  const retry = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${refreshedToken}` },
                  });
                  if (retry.ok) {
                    const userData = await retry.json();
                    get().setUser(userData);
                  } else {
                    get().logout();
                    return;
                  }
                } else {
                  get().logout();
                  return;
                }
              }
            } catch (error) {
              // Don't logout on network errors
            } finally {
              set({ isLoading: false });
            }
          }

          set({ isAuthenticated: true });
        } catch (error) {
          get().logout();
        }
      },

      initializeAuth: async () => {
        let { accessToken, refreshToken } = get();
        if (!accessToken) {
          const storedAccessToken = localStorage.getItem('accessToken');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          if (storedAccessToken) {
            get().setTokens(storedAccessToken, storedRefreshToken);
            accessToken = storedAccessToken;
            refreshToken = storedRefreshToken;
          }
        }
        if (accessToken && !localStorage.getItem('accessToken')) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken && !localStorage.getItem('refreshToken')) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (accessToken && !get().user) {
          await get().checkAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      // Skip hydration to prevent automatic API calls during SSR
      skipHydration: true,
    }
  )
);