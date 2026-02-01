"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/lib/store/auth";

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const { accessToken } = useAuthStore();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email and try again.");
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/email/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Your email has been successfully verified!");
      } else {
        setStatus("error");
        setMessage(data.message || "Verification failed. The link may have expired or is invalid.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Verification failed. The link may have expired or is invalid.");
    }
  };

  const resendVerification = async () => {
    setStatus("loading");
    if (!accessToken) {
      setStatus("error");
      setMessage("Please log in to resend the verification email.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/email/send-verification`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "A new verification email has been sent. Please check your inbox.");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-blue-600 to-teal-500 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1920&q=95&fit=crop&crop=faces')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-900/50 to-blue-950/70"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white px-12 max-w-md">
          <Mail className="h-16 w-16 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Email Verification</h1>
          <p className="text-lg text-blue-100">
            Verify your email address to get started with MedBook and access all features.
          </p>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative">
        {/* Decorative background for smaller screens */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-8">
                  {message}
                </p>

                <Link
                  href="/auth/login"
                  className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
                >
                  Continue to Login
                </Link>

                <p className="text-sm text-gray-600">
                  You can now access all features of your account.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-8">
                  {message}
                </p>

                <button
                  onClick={resendVerification}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4"
                >
                  Resend Verification Email
                </button>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    If you continue to have issues, please contact our support team.
                  </p>
                </div>

                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Back to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
