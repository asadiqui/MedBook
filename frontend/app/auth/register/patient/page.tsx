"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";
import { PasswordInput, FormField, TermsAgreement } from "@/components/auth";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { useRegistration } from "@/lib/hooks/useRegistration";

export const dynamic = 'force-dynamic';

export default function PatientRegisterPage() {
  const { isAuthenticated, user } = useAuthRedirect();

  if (isAuthenticated && user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    agreedToTerms: false,
  });

  const { register, isLoading, errors } = useRegistration({
    role: "PATIENT",
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://localhost:8443/api",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toast.error("Sorry, you need to be 18 or older to use MedBook");
        return;
      }
    }

    const success = await register(formData);
    if (success) {
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1200&q=80')",
          }}
        />
        
        {}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-600/30 to-teal-800/70" />

        {}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white w-full">
          {}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Healthcare simplified<br />for everyone.
            </h1>
            
            <p className="text-lg text-white/90 leading-relaxed">
              Join thousands of patients who trust MedBook to manage appointments, prescriptions, and records securely online.
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
            <span className="text-gray-600">Already a member? </span>
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Log in
            </Link>
          </div>
        </div>

        <div className="w-full max-w-xl 2xl:max-w-2xl mt-20 relative z-10">
          {}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Fill in your details to get started with your health journey.</p>
          </div>

          {}
          <form onSubmit={handleSubmit} className="space-y-5">
            {}
            <button
              type="button"
              onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
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

            {}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or sign up with email</span>
              </div>
            </div>
            {}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" required>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Jane"
                />
              </FormField>
              <FormField label="Last Name" required>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Doe"
                />
              </FormField>
            </div>

            {}
            <FormField label="Email Address" error={errors.email} required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="jane@example.com"
                />
              </div>
            </FormField>

            {}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone Number" error={errors.phone} required>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </FormField>
              <FormField label="Date of Birth" error={errors.dateOfBirth} required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    title="You must be at least 18 years old to register"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </FormField>
            </div>

            {}
            <FormField label="Gender" error={errors.gender} required>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>

            {}
            <FormField label="Create Password" error={errors.password} required>
              <PasswordInput
                value={formData.password}
                onChange={(password) => setFormData({ ...formData, password })}
                placeholder="Min. 8 characters"
              />
            </FormField>

            {}
            <TermsAgreement
              agreedToTerms={formData.agreedToTerms}
              onTermsChange={(agreed) => setFormData({ ...formData, agreedToTerms: agreed })}
              error={errors.agreedToTerms}
            />

            {}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create My Account
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
