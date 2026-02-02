"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { initializeAuth, setBootstrapping, isLoading, authChecked } = useAuthStore();
  const pathname = usePathname();
  const hasInitializedRef = useRef(false);

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
    if (!pathname) return;
    if (pathname === '/auth/callback') return;
    if (hasInitializedRef.current) return;
    if (authChecked) return;

    hasInitializedRef.current = true;
    let isMounted = true;

    const bootstrapAuth = async () => {
      if (!isMounted) return;
      setBootstrapping(true);
      await initializeAuth();
      if (isMounted) {
        setBootstrapping(false);
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

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