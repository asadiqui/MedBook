"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface UseRegistrationProps {
  role: "PATIENT" | "DOCTOR";
  apiUrl: string;
}

export const useRegistration = ({ role, apiUrl }: UseRegistrationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: any) => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the terms";

    if (role === "DOCTOR") {
      if (!formData.specialty?.trim()) newErrors.specialty = "Specialty is required";
      if (!formData.licenseNumber?.trim()) newErrors.licenseNumber = "License number is required";
      if (!formData.affiliation?.trim()) newErrors.affiliation = "Medical affiliation is required";
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required";
      if (!formData.clinicAddress?.trim()) newErrors.clinicAddress = "Clinic address is required";
      if (!formData.clinicContactPerson?.trim()) newErrors.clinicContactPerson = "Clinic contact person is required";
      if (!formData.clinicPhone?.trim()) newErrors.clinicPhone = "Clinic phone is required";
      if (!formData.consultationFee) newErrors.consultationFee = "Consultation fee is required";
      if (!formData.agreedToVerification) newErrors.agreedToVerification = "You must agree to verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const register = async (formData: any, uploadedFile?: File | null) => {
    if (!validateForm(formData)) {
      return false;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();

      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("phone", formData.phone);
      submitData.append("dateOfBirth", formData.dateOfBirth);
      submitData.append("gender", formData.gender);
      submitData.append("role", role);

      if (role === "DOCTOR") {
        submitData.append("specialty", formData.specialty);
        submitData.append("licenseNumber", formData.licenseNumber);
        submitData.append("affiliation", formData.affiliation);
        submitData.append("yearsOfExperience", formData.yearsOfExperience.toString());
        submitData.append("clinicAddress", formData.clinicAddress);
        submitData.append("clinicContactPerson", formData.clinicContactPerson);
        submitData.append("clinicPhone", formData.clinicPhone);
        submitData.append("consultationFee", formData.consultationFee.toString());

        if (uploadedFile) {
          submitData.append("licenseDocument", uploadedFile);
        }
      }

      const response = await api.post("/auth/register", submitData);

      toast.success("Registration successful! Please check your email to verify your account.");
      return true;
    } catch (error: any) {
      const rawMessage = error.response?.data?.message || "Registration failed";
      const normalized = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
      const lower = normalized.toLowerCase();

      let friendlyMessage = normalized;
      if (lower.includes("at least 18") || lower.includes("18 years old")) {
        friendlyMessage = "Sorry, you need to be 18 or older to register.";
      } else if (lower.includes("date of birth") && lower.includes("future")) {
        friendlyMessage = "Date of birth cannot be in the future.";
      } else if (lower.includes("date") && lower.includes("valid") && lower.includes("iso")) {
        friendlyMessage = "Please enter a valid date of birth.";
      }

      toast.error(friendlyMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    errors,
    setErrors,
  };
};