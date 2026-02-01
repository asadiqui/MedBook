"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth";
import { useAuth } from "@/lib/hooks/useAuth";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { initializeAuth, setHasHydrated, setBootstrapping } = useAuthStore();
  const { user, isBootstrapping, requireAuth } = useAuth();
  const pathname = usePathname();

  const requiredRoles = useMemo(() => {
    if (!pathname) return null;

    if (pathname.startsWith("/admin")) return ["ADMIN"];
    if (pathname.startsWith("/availability")) return ["DOCTOR"];
    if (pathname.startsWith("/appointments")) return ["PATIENT", "DOCTOR"];
    if (pathname.startsWith("/dashboard")) return ["PATIENT", "DOCTOR"];
    if (pathname.startsWith("/chat")) return ["PATIENT", "DOCTOR"];
    if (pathname.startsWith("/book-appointment")) return ["PATIENT"];
    if (pathname.startsWith("/find-doctor")) return ["PATIENT"];
    if (pathname.startsWith("/profile/doctor")) return ["DOCTOR"];
    if (pathname.startsWith("/profile/patient")) return ["PATIENT"];

    return null;
  }, [pathname]);

  useEffect(() => {
    // Skip auth initialization on callback page to avoid conflicts
    if (pathname === '/auth/callback') {
      return;
    }

    // Initialize auth state on client-side mount (for page refreshes)
    const bootstrapAuth = async () => {
      setBootstrapping(true);
      await useAuthStore.persist.rehydrate();
      setHasHydrated(true);
      await initializeAuth();
      setBootstrapping(false);
    };

    bootstrapAuth();
  }, [initializeAuth, pathname, setHasHydrated, setBootstrapping]);

  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith("/auth")) {
      return;
    }

    if (isBootstrapping) return;

    if (requiredRoles) {
      requireAuth(requiredRoles);
    }
  }, [isBootstrapping, pathname, requireAuth, requiredRoles, user]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 5000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}