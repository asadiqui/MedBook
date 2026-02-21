"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/store/auth";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import api from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { checkAuth } = useAuthStore();
  const { isAuthenticated, user } = useAuthRedirect();
  const searchParams = useSearchParams();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setGeneralError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  if (isAuthenticated && user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError("");
    
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
        twoFactorCode: data.twoFactorCode || undefined,
      });

      const responseData = response.data;

      if (responseData.redirectPath) {
        useAuthStore.setState({ redirectPath: responseData.redirectPath });
      }

      await checkAuth();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      
      if (message?.includes("Two-factor authentication code is required")) {
        setShowTwoFactor(true);
        setGeneralError("Please enter your 2FA code");
      } else {
        setGeneralError(message || "Login failed. Please try again.");
      }
    }
  };

  const handleGoogleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${apiBase}/auth/google`;
  };

  if (isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/login-doctor.jpeg')",
          }}
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/85" />

        {}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white w-full [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
          {}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight drop-shadow-lg">
              Your Health,<br />Simplified.
            </h1>
            
            <p className="text-lg text-white/90 leading-relaxed">
              Access your medical history, book appointments with top specialists, and manage your health journey all in one secure place.
            </p>
          </div>

          {}
          <div className="text-sm text-white/70 mt-12">
            © 2026 MedBook. All rights reserved.
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative overflow-hidden">
        {}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
          {}
          <Link href="/" className="inline-flex">
            <Logo size="md" />
          </Link>
          
          {}
          <div className="text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/auth/register" className="text-blue-600 font-semibold hover:text-blue-700">
              Register now
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mt-20 relative z-10">
          {}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Please enter your details to access your account.</p>
          </div>

          {}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {generalError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {showTwoFactor && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Two-Factor Code
                </label>
                <input
                  type="text"
                  id="twoFactorCode"
                  {...register("twoFactorCode")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>

            {}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            {}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            {}
            <p className="text-xs text-center text-gray-500">
              <strong>Note for doctors:</strong> Please use email/password login. Google sign-in is for patients only.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
