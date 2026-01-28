"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            twoFactorCode: formData.twoFactorCode || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.message?.includes("Two-factor authentication code is required")) {
          setShowTwoFactor(true);
          setError("Please enter your 2FA code");
        } else {
          setError(data.message || "Login failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Store tokens
      if (data.tokens) {
        localStorage.setItem("accessToken", data.tokens.accessToken);
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
      }

      // Redirect based on role
      const role = data.user.role;
      if (role === "PATIENT") {
        window.location.href = "/profile/patient";
      } else if (role === "DOCTOR") {
        window.location.href = "/profile/doctor";
      } else if (role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/google`;
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple login when available
    console.log("Apple login not yet implemented");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1920&q=95&fit=crop&crop=faces')",
          }}
        />
        
        {/* Dark Blue Gradient Overlay - Lighter for clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-900/50 to-blue-950/70" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white w-full">
          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Your Health,<br />Simplified.
            </h1>
            
            <p className="text-lg text-white/90 leading-relaxed">
              Access your medical history, book appointments with top specialists, and manage your health journey all in one secure place.
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/70 mt-12">
            © 2026 Sa7ti. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Top Bar - Absolute Positioning */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-lg shadow-sm">
              <svg className="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="1" />
                <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Sa7ti</span>
          </div>
          
          {/* Register Link */}
          <div className="text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/auth/register" className="text-blue-600 font-semibold hover:text-blue-700">
              Register now
            </Link>
          </div>
        </div>

        <div className="w-full max-w-md mt-20 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Please enter your details to access your account.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication (conditionally shown) */}
            {showTwoFactor && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Two-Factor Code
                </label>
                <input
                  type="text"
                  id="twoFactorCode"
                  value={formData.twoFactorCode}
                  onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Log In
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            {/* Note for Doctors */}
            <p className="text-xs text-center text-gray-500">
              <strong>Note for doctors:</strong> Please use email/password login. Google sign-in is for patients only.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
