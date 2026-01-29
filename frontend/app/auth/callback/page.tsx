"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Decode JWT to get user role
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const role = payload.role;

      // Redirect based on role
      if (role === "PATIENT") {
        router.push("/profile/patient");
      } else if (role === "DOCTOR") {
        router.push("/profile/doctor");
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/auth/login");
      }
    } else {
      // No tokens, redirect to login
      router.push("/auth/login");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Logo size="lg" showText={false} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing Sign In...</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Please wait</p>
        </div>
      </div>
    </div>
  );
}
