"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { initializeAuth, setBootstrapping, isLoading, authChecked } = useAuthStore();
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
    if (!pathname) return;
    if (pathname === '/auth/callback') return;
    if (authChecked) return;

    const bootstrapAuth = async () => {
      setBootstrapping(true);
      await initializeAuth();
      setBootstrapping(false);
    };

    bootstrapAuth();
  }, [pathname, authChecked]);

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