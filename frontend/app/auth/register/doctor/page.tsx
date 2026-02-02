"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Mail, Phone, Calendar, Upload, FileText, DollarSign, MapPin, User } from "lucide-react";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";
import { PasswordInput, FormField, FileUpload, TermsAgreement } from "@/components/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRegistration } from "@/lib/hooks/useRegistration";

export default function DoctorRegisterPage() {
  const { isAuthenticated, redirectBasedOnRole } = useAuth();
  const hasRedirectedRef = useRef(false);

  if (isAuthenticated && !hasRedirectedRef.current) {
    hasRedirectedRef.current = true;
    redirectBasedOnRole();
    return null;
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    specialty: "",
    licenseNumber: "",
    affiliation: "",
    yearsOfExperience: "",
    clinicAddress: "",
    clinicContactPerson: "",
    clinicPhone: "",
    consultationFee: "",
    agreedToTerms: false,
    agreedToVerification: false,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { register, isLoading, errors } = useRegistration({
    role: "DOCTOR",
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
        toast.error("Sorry, you need to be 18 or older to register as a doctor");
        return;
      }
    }

    const success = await register(formData, uploadedFile);
    if (success) {
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    }
  };

  const specializations = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "General Practice",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Other"
  ];

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        {}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&q=95&fit=crop&crop=faces')",
          }}
        />
        
        {}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/30 to-blue-900/70" />

        {}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white w-full">
          {}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Partner with us.<br />Grow your practice.
            </h1>
            
            <p className="text-lg text-white/90 leading-relaxed">
              Join over 10,000 healthcare providers. Register today to manage appointments and reach new patients seamlessly.
            </p>
          </div>

          {}
          <div className="text-sm text-white/70 mt-12">
            © 2026 MedBook Inc. All rights reserved.
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
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Log in
            </Link>
          </div>
        </div>

        <div className="w-full max-w-2xl 2xl:max-w-3xl mt-20 mb-8 relative z-10">
          {}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Doctor Registration</h2>
            <p className="text-gray-600">Please fill out the form below to register. All steps are required to verify your medical practice.</p>
          </div>

          {}
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>

              <div className="space-y-4">
                {}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="First Name" required>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Jane"
                    />
                  </FormField>
                  <FormField label="Last Name" required>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Doe"
                    />
                  </FormField>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Email Address" error={errors.email} required>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="jane.doe@example.com"
                      />
                    </div>
                  </FormField>
                  <FormField label="Phone Number" error={errors.phone} required>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </FormField>
                </div>

                {}
                <FormField label="Create Password" error={errors.password} required>
                  <PasswordInput
                    value={formData.password}
                    onChange={(password) => setFormData({ ...formData, password })}
                    placeholder="Min. 8 characters including a number and a special character"
                  />
                </FormField>

                {}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Gender" error={errors.gender} required>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </FormField>
                  <FormField label="Date of Birth" error={errors.dateOfBirth} required>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      title="You must be at least 18 years old to register"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Professional Credentials</h3>
              </div>

              <div className="space-y-4">
                {}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Specialization" error={errors.specialty} required>
                    <select
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Medical License Number" error={errors.licenseNumber} required>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="e.g. MD-12345.67"
                    />
                  </FormField>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Current Affiliation" error={errors.affiliation} required>
                    <input
                      type="text"
                      value={formData.affiliation}
                      onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Clinic or Hospital Name"
                    />
                  </FormField>
                  <FormField label="Years of Experience" error={errors.yearsOfExperience} required>
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="e.g. 5"
                      min="0"
                    />
                  </FormField>
                </div>

                {}
                <FormField label="Consultation Fee ($)" error={errors.consultationFee} required>
                  <input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. 100"
                    min="0"
                    step="0.01"
                  />
                </FormField>
              </div>
            </div>

            {}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Clinic Information</h3>
              </div>

              <div className="space-y-4">
                {}
                <FormField label="Clinic / Hospital Address" error={errors.clinicAddress} required>
                  <input
                    type="text"
                    value={formData.clinicAddress}
                    onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="123 Medical Plaza, Suite 400"
                  />
                </FormField>

                {}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Contact Person" error={errors.clinicContactPerson} required>
                    <input
                      type="text"
                      value={formData.clinicContactPerson}
                      onChange={(e) => setFormData({ ...formData, clinicContactPerson: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Admin Name or Self"
                    />
                  </FormField>
                  <FormField label="Clinic Phone Number" error={errors.clinicPhone} required>
                    <input
                      type="tel"
                      value={formData.clinicPhone}
                      onChange={(e) => setFormData({ ...formData, clinicPhone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="+1 (555) 999-8888"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              </div>

              <div>
                <FileUpload
                  label="Upload Medical License / Certification"
                  onFileSelect={setUploadedFile}
                  selectedFile={uploadedFile}
                  required
                />
              </div>
            </div>

            {}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirmation</h3>
              
              <div className="space-y-3 mb-5">
                <p className="text-sm text-gray-700">By clicking complete, you confirm the following details:</p>
                <ul className="space-y-2 text-sm text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Account creation with your personal email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Credentials verification for the listed specialization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Association with the specified medical facility</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <TermsAgreement
                  agreedToTerms={formData.agreedToTerms}
                  agreedToVerification={formData.agreedToVerification}
                  onTermsChange={(agreed) => setFormData({ ...formData, agreedToTerms: agreed })}
                  onVerificationChange={(agreed) => setFormData({ ...formData, agreedToVerification: agreed })}
                  showVerification={true}
                  error={errors.agreedToTerms || errors.agreedToVerification}
                />
              </div>
            </div>

            {}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Registration
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
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
