"use client";

import Link from "next/link";
import { Mail, Phone, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/components/ui/Logo";
import { PasswordInput, FormField, TermsAgreement } from "@/components/auth";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { NameFields } from "@/components/auth/NameFields";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { useRegistration } from "@/lib/hooks/useRegistration";

export const dynamic = 'force-dynamic';

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { errorMap: () => ({ message: "Please select a gender" }) }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientRegisterPage() {
  const { isAuthenticated, user } = useAuthRedirect();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
    setValue,
    watch,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: undefined,
      password: "",
      agreedToTerms: false,
    },
  });

  const { register: registerUser, isLoading, errors: apiErrors } = useRegistration({
    role: "PATIENT",
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  });

  if (isAuthenticated && user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  const onSubmit = async (data: PatientFormData) => {
    const birthDate = new Date(data.dateOfBirth);
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

    const success = await registerUser(data);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <GoogleOAuthButton />

            <AuthDivider />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name" error={formErrors.firstName?.message} required>
                <input
                  type="text"
                  {...registerField("firstName")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Jane"
                />
              </FormField>
              <FormField label="Last Name" error={formErrors.lastName?.message} required>
                <input
                  type="text"
                  {...registerField("lastName")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Doe"
                />
              </FormField>
            </div>

            {}
            <FormField label="Email Address" error={formErrors.email?.message || apiErrors.email} required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...registerField("email")}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="jane@example.com"
                />
              </div>
            </FormField>

            {}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone Number" error={formErrors.phone?.message || apiErrors.phone} required>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...registerField("phone", {
                      onChange: (e) => {
                        const value = e.target.value.replace(/[^0-9+\s()-]/g, '');
                        setValue("phone", value);
                      }
                    })}
                    inputMode="numeric"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </FormField>
              <FormField label="Date of Birth" error={formErrors.dateOfBirth?.message || apiErrors.dateOfBirth} required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    {...registerField("dateOfBirth", {
                      onChange: (e) => {
                        e.target.setCustomValidity('');
                      }
                    })}
                    onInvalid={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.setCustomValidity('You must be at least 18 years old to register');
                    }}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </FormField>
            </div>

            {}
            <FormField label="Gender" error={formErrors.gender?.message || apiErrors.gender} required>
              <select
                {...registerField("gender")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FormField>

            {}
            <FormField label="Create Password" error={formErrors.password?.message || apiErrors.password} required>
              <PasswordInput
                value={watch("password")}
                onChange={(password) => setValue("password", password)}
                placeholder="Min. 8 characters"
              />
            </FormField>

            {}
            <TermsAgreement
              agreedToTerms={watch("agreedToTerms")}
              onTermsChange={(agreed) => setValue("agreedToTerms", agreed)}
              error={formErrors.agreedToTerms?.message || apiErrors.agreedToTerms}
            />

            {}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isSubmitting || isLoading) ? (
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
