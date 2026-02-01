"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/store/auth";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTokens, checkAuth, user, isLoading, setHasHydrated, setBootstrapping } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent multiple processing
    if (hasProcessed) return;

    const accessToken = searchParams?.get("accessToken");
    const refreshToken = searchParams?.get("refreshToken");


    const processAuth = async () => {
      if (accessToken && refreshToken) {
        try {
          setHasProcessed(true);
          setBootstrapping(true);
          setHasHydrated(true);

          // Set a timeout for the auth process
          const timeout = setTimeout(() => {
            setError("Authentication is taking too long. Please try again.");
            setTimeout(() => router.push("/auth/login"), 3000);
          }, 15000); // 15 second timeout

          setTimeoutId(timeout);

          // Store tokens first
          setTokens(accessToken, refreshToken);

          // Validate auth and fetch user data
          await checkAuth();

          // Clear timeout since auth succeeded
          clearTimeout(timeout);
          setTimeoutId(null);
          setBootstrapping(false);

          // Check if we have user data now
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {

            // Show success message briefly before redirecting
            setTimeout(() => {
              // Redirect based on role directly
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
            }, 1000); // 1 second delay to show success message
          } else {
            setError("Failed to authenticate user");
            setTimeout(() => router.push("/auth/login"), 3000);
          }
        } catch (error) {
          if (timeoutId) clearTimeout(timeoutId);
          setBootstrapping(false);
          setError("Authentication failed");
          setTimeout(() => router.push("/auth/login"), 3000);
        }
      } else {
        // No tokens, redirect to login
        setBootstrapping(false);
        setError("No authentication tokens received");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    };

    processAuth();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchParams, router, setTokens, checkAuth, hasProcessed]);

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
