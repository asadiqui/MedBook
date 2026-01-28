"use client";

import Link from "next/link";
import { User, Stethoscope, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=1200&q=80')",
          }}
        />
        
        {/* Blue Gradient Overlay - Clear Face at Top */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/30 to-blue-800/70" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white w-full">
          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Start your<br />journey with<br />us today.
            </h1>
            
            <p className="text-base text-blue-50 leading-relaxed">
              Whether you are looking for care or<br />
              providing it, Sa7ti streamlines<br />
              the healthcare experience for<br />
              everyone.
            </p>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2} />
                <span className="text-sm">Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2} />
                <span className="text-sm">Instant Access</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div>
            <p className="text-xs text-blue-100">
              © 2026 Sa7ti Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Options */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8 relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Top Bar */}
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
          
          {/* Already have account */}
          <div className="text-sm">
            <span className="text-gray-600">Already have an account?</span>{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-3xl relative z-10 mt-20">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Join Sa7ti
            </h2>
            <p className="text-gray-500">
              Choose how you want to use the platform to get started.
            </p>
          </div>

          {/* Registration Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Patient Card */}
            <Link href="/auth/register/patient">
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer h-full">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Register as a Patient
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  Book appointments, manage your health<br />
                  records, and connect with top specialists<br />
                  easily.
                </p>
                
                <span className="inline-block text-sm text-blue-600 font-semibold hover:underline">
                  Get Started
                </span>
              </div>
            </Link>

            {/* Doctor Card */}
            <Link href="/auth/register/doctor">
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer h-full">
                <div className="bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-teal-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Register as a Doctor
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  Manage your schedule, grow your patient<br />
                  base, and set your availability and<br />
                  consultation fees.
                </p>
                
                <span className="inline-block text-sm text-teal-600 font-semibold hover:underline">
                  Join as Provider
                </span>
              </div>
            </Link>
          </div>

          {/* Terms Footer */}
          <p className="text-center text-xs text-gray-500">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
