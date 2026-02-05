"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { checkAuth, setBootstrapping, authChecked } = useAuthStore();
  const pathname = usePathname();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!pathname || pathname === '/auth/callback') return;
    if (hasInitializedRef.current || authChecked) return;

    hasInitializedRef.current = true;
    let isMounted = true;

    const bootstrapAuth = async () => {
      if (!isMounted) return;
      setBootstrapping(true);
      await checkAuth();
      if (isMounted) {
        setBootstrapping(false);
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, authChecked, checkAuth, setBootstrapping]);

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