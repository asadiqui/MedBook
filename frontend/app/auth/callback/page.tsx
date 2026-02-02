"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/store/auth";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkAuth, user, isLoading, setBootstrapping } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {

    if (hasProcessed) return;

    const success = searchParams?.get("success");
    const errorParam = searchParams?.get("error");

    const processAuth = async () => {
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setTimeout(() => router.push("/auth/login"), 3000);
        return;
      }

      if (success === "1") {
        try {
          setHasProcessed(true);
          setBootstrapping(true);

          await checkAuth();

          setBootstrapping(false);

          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            switch (currentUser.role) {
              case 'ADMIN':
                router.push('/admin/dashboard');
                break;
              case 'DOCTOR':
              case 'PATIENT':
                router.push('/dashboard');
                break;
              default:
                router.push('/auth/login');
            }
          } else {
            setError("Failed to authenticate user");
            setTimeout(() => router.push("/auth/login"), 3000);
          }
        } catch (error) {
          setBootstrapping(false);
          setError("Authentication failed");
          setTimeout(() => router.push("/auth/login"), 3000);
        }
      } else {
        setBootstrapping(false);
        setError("No authentication confirmation received");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    };

    processAuth();
  }, [searchParams, router, checkAuth, hasProcessed, setBootstrapping]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Logo size="lg" showText={false} />
        </div>
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Sign In Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <p>Redirecting to login...</p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLoading ? "Completing Sign In..." : "Sign In Successful!"}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <Loader2 className={`h-5 w-5 ${isLoading ? 'animate-spin' : 'hidden'}`} />
              <p>{isLoading ? "Please wait" : "Redirecting to your dashboard..."}</p>
            </div>
            {!isLoading && user && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Welcome back, {user.firstName}!
                </p>
                <p className="text-xs text-gray-400">
                  Taking you to your {user.role.toLowerCase()} dashboard...
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
