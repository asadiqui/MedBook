"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/store/auth";
import api from "@/lib/api";

export const dynamic = 'force-dynamic';

export default function TwoFactorVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const [tempToken, setTempToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams?.get("temp");
    if (token) {
      setTempToken(token);
    } else {
      setError("Invalid session. Please try logging in again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    if (!tempToken) {
      setError("Invalid session. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post("/auth/google/verify-2fa", {
        tempToken,
        twoFactorCode,
      });

      if (response.data.redirectPath) {
        useAuthStore.setState({ redirectPath: response.data.redirectPath });
      }

      await checkAuth();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid 2FA code. Please try again.");
      setTwoFactorCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Decorative */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-blue-600 to-teal-500 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=95&fit=crop&crop=faces')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-900/50 to-blue-950/70"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white px-12 max-w-md">
          <Shield className="h-16 w-16 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Two-Factor Authentication</h1>
          <p className="text-lg text-blue-100">
            Your account has an extra layer of security. Enter the 6-digit code from your authenticator app.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative">
        {/* Mobile background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
            <p className="text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="twoFactorCode"
                  value={twoFactorCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 6) {
                      setTwoFactorCode(value);
                    }
                  }}
                  required
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  autoComplete="off"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Open your authenticator app (Google Authenticator, Authy, etc.) to get the code
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || twoFactorCode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Make sure you're entering the current code from your authenticator app. 
              The code refreshes every 30 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
