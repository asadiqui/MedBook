"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, Mail, Phone, Camera, Lock, Shield, 
  Bell, Trash2, LogOut, Edit2, X, Check, Calendar,
  Briefcase, FileText, DollarSign, MapPin, Award, Clock
} from "lucide-react";
import toast from "react-hot-toast";

export default function DoctorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState("");
  
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE" as string,
    dateOfBirth: "",
    bio: "",
    avatar: null as string | null,
  });

  const [doctorData, setDoctorData] = useState({
    specialty: "",
    licenseNumber: "",
    licenseDocument: null as string | null,
    consultationFee: 0,
    affiliation: "",
    yearsOfExperience: 0,
    clinicAddress: "",
    clinicContactPerson: "",
    clinicPhone: "",
    isVerified: false,
  });

  const [editData, setEditData] = useState({ ...userData, ...doctorData });

  const [securityData, setSecurityData] = useState({
    lastPasswordChange: "2 months ago",
    twoFactorEnabled: false,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        window.location.href = "/auth/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }));
        toast.error(errorData.message || 'Your session has expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/auth/login";
        }, 2000);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const user = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "MALE",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          bio: data.bio || "",
          avatar: data.avatar || null,
        };
        const doctor = {
          specialty: data.specialty || "",
          licenseNumber: data.licenseNumber || "",
          licenseDocument: data.licenseDocument || null,
          consultationFee: data.consultationFee || 0,
          affiliation: data.affiliation || "",
          yearsOfExperience: data.yearsOfExperience || 0,
          clinicAddress: data.clinicAddress || "",
          clinicContactPerson: data.clinicContactPerson || "",
          clinicPhone: data.clinicPhone || "",
          isVerified: data.isVerified || false,
        };
        setUserData(user);
        setDoctorData(doctor);
        setEditData({ ...user, ...doctor });
        setIsOAuthUser(data.isOAuth || false);
        setSecurityData({
          lastPasswordChange: "2 months ago",
          twoFactorEnabled: data.isTwoFactorEnabled || false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = JSON.parse(atob(accessToken!.split(".")[1]));
      const userId = payload.sub;

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Refresh user data to get the updated avatar
        await fetchUserData();
        toast.success("Avatar uploaded successfully!");
      } else {
        toast.error("Failed to upload avatar");
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Failed to upload avatar");
    }
  };

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = JSON.parse(atob(accessToken!.split(".")[1]));
      const userId = payload.sub;

      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}/license-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDoctorData({ ...doctorData, licenseDocument: data.licenseDocument });
        setEditData({ ...editData, licenseDocument: data.licenseDocument });
        toast.success("License document uploaded successfully!");
      } else {
        toast.error("Failed to upload license document");
      }
    } catch (error) {
      console.error("Failed to upload license:", error);
      toast.error("Failed to upload license document");
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({ ...userData, ...doctorData });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = JSON.parse(atob(accessToken!.split(".")[1]));
      const userId = payload.sub;

      // Prepare update data, filtering out empty values
      const updateData: any = {
        firstName: editData.firstName,
        lastName: editData.lastName,
      };

      if (editData.phone) updateData.phone = editData.phone;
      if (editData.gender) updateData.gender = editData.gender;
      if (editData.dateOfBirth) updateData.dateOfBirth = editData.dateOfBirth;
      if (editData.bio) updateData.bio = editData.bio;
      if (editData.specialty) updateData.specialty = editData.specialty;
      if (editData.licenseNumber) updateData.licenseNumber = editData.licenseNumber;
      if (editData.consultationFee) updateData.consultationFee = parseFloat(editData.consultationFee);
      if (editData.affiliation) updateData.affiliation = editData.affiliation;
      if (editData.yearsOfExperience) updateData.yearsOfExperience = parseInt(editData.yearsOfExperience);
      if (editData.clinicAddress) updateData.clinicAddress = editData.clinicAddress;
      if (editData.clinicContactPerson) updateData.clinicContactPerson = editData.clinicContactPerson;
      if (editData.clinicPhone) updateData.clinicPhone = editData.clinicPhone;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        setUserData({
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email,
          phone: editData.phone,
          gender: editData.gender,
          dateOfBirth: editData.dateOfBirth,
          bio: editData.bio,
          avatar: editData.avatar,
        });
        setDoctorData({
          specialty: editData.specialty,
          licenseNumber: editData.licenseNumber,
          licenseDocument: editData.licenseDocument,
          consultationFee: editData.consultationFee,
          affiliation: editData.affiliation,
          yearsOfExperience: editData.yearsOfExperience,
          clinicAddress: editData.clinicAddress,
          clinicContactPerson: editData.clinicContactPerson,
          clinicPhone: editData.clinicPhone,
          isVerified: doctorData.isVerified,
        });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/auth/login";
  };

  const getAvatarUrl = (avatar: string | null) => {
    if (!avatar) return null;
    // If it's already a full URL (Google OAuth), return as is
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    // If it's a relative path from our backend, prepend the base URL and add cache-busting
    return `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}${avatar}?t=${Date.now()}`;
  };

  const handleEnable2FA = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/2fa/enable`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCodeUrl);
        setTwoFactorSecret(data.secret);
        setShow2FAModal(true);
      } else {
        toast.error("Failed to generate 2FA QR code");
      }
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
      toast.error("Failed to enable 2FA");
    }
  };

  const handleVerify2FA = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/2fa/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            token: verificationCode,
          }),
        }
      );

      if (response.ok) {
        setSecurityData({ ...securityData, twoFactorEnabled: true });
        setShow2FAModal(false);
        setVerificationCode("");
        toast.success("Two-factor authentication enabled successfully!");
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error) {
      console.error("Failed to verify 2FA:", error);
      toast.error("Failed to verify 2FA");
    }
  };

  const handleDisable2FA = async () => {
    if (!disable2FACode || disable2FACode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/2fa/disable`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: disable2FACode }),
        }
      );

      if (response.ok) {
        setSecurityData({ ...securityData, twoFactorEnabled: false });
        setShowDisable2FAModal(false);
        setDisable2FACode("");
        toast.success("Two-factor authentication disabled");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      toast.error("Failed to disable 2FA");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const payload = JSON.parse(atob(accessToken!.split(".")[1]));
      const userId = payload.sub;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Account deleted successfully");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setTimeout(() => window.location.href = "/auth/login", 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="py-7 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-200">
              <svg className="h-7 w-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="1" />
                <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Sa7ti</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/availability"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <Calendar className="h-5 w-5" />
            Availability
          </Link>
          <Link
            href="/appointments"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <Clock className="h-5 w-5" />
            Appointments
          </Link>
          <Link
            href="/messages"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Messages
          </Link>
          <Link
            href="/profile/doctor"
            className="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition w-full"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your personal information and security</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition">
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                {userData.avatar ? (
                  <img
                    src={getAvatarUrl(userData.avatar)}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {userData.firstName?.[0] || ''}{userData.lastName?.[0] || ''}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">Dr. {userData.firstName} {userData.lastName}</p>
                    {doctorData.isVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">Doctor</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-600">Update your photo and personal details.</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="relative">
                  {userData.avatar ? (
                    <img
                      src={getAvatarUrl(userData.avatar)}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {userData.firstName?.[0] || ''}{userData.lastName?.[0] || ''}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Profile Picture</h3>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF. Max 2MB.</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">FULL NAME</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        placeholder="First name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        placeholder="Last name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">Dr. {userData.firstName} {userData.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">EMAIL ADDRESS</label>
                  <p className="text-sm text-gray-900">{userData.email}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">PHONE NUMBER</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="+1 (555) 000-1234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{userData.phone || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">GENDER</label>
                  {isEditing ? (
                    <select
                      value={editData.gender}
                      onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{userData.gender?.toLowerCase() || "Not provided"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">SPECIALTY</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.specialty}
                      onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
                      placeholder="e.g., Cardiology"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{doctorData.specialty || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Professional Bio */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-500 mb-2">PROFESSIONAL BIO</label>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell patients about your experience and expertise..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{userData.bio || "No bio provided"}</p>
                )}
              </div>

              {/* Professional Details */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Professional Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">LICENSE NUMBER</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.licenseNumber}
                        onChange={(e) => setEditData({ ...editData, licenseNumber: e.target.value })}
                        placeholder="MED-2024-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{doctorData.licenseNumber || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">YEARS OF EXPERIENCE</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.yearsOfExperience}
                        onChange={(e) => setEditData({ ...editData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                        placeholder="15"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{doctorData.yearsOfExperience} years</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CONSULTATION FEE</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.consultationFee}
                        onChange={(e) => setEditData({ ...editData, consultationFee: parseFloat(e.target.value) || 0 })}
                        placeholder="150"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">${doctorData.consultationFee}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">AFFILIATION</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.affiliation}
                        onChange={(e) => setEditData({ ...editData, affiliation: e.target.value })}
                        placeholder="City General Hospital"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{doctorData.affiliation || "Not provided"}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">CLINIC ADDRESS</label>
                    {isEditing ? (
                      <textarea
                        value={editData.clinicAddress}
                        onChange={(e) => setEditData({ ...editData, clinicAddress: e.target.value })}
                        rows={2}
                        placeholder="Full clinic address..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{doctorData.clinicAddress || "Not provided"}</p>
                    )}
                  </div>

                  {doctorData.licenseDocument && (
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">LICENSE DOCUMENT</label>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${doctorData.licenseDocument}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Document
                        </a>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-2">UPLOAD LICENSE DOCUMENT</label>
                      <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition text-sm font-medium">
                        Choose File
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleLicenseUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG. Max 5MB.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Manage your password and account protection.</p>
            </div>

            <div className="p-6 space-y-4">
              {!isOAuthUser && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg">
                      <Lock className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Password</h3>
                      <p className="text-xs text-gray-600">Last changed {securityData.lastPasswordChange}</p>
                    </div>
                  </div>
                  <Link
                    href="/auth/reset-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Change Password
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-white p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-600">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {securityData.twoFactorEnabled ? (
                    <>
                      <span className="text-xs font-medium text-green-600">Enabled</span>
                      <button
                        onClick={() => setShowDisable2FAModal(true)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Disable
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEnable2FA}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <Bell className="h-5 w-5 text-gray-700" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Notification Preferences</h3>
                    <p className="text-xs text-gray-600">Choose what you want to be notified about.</p>
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-4">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Delete Account</h3>
                    <p className="text-xs text-gray-600">Permanently remove your account and data.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Enable Two-Factor Authentication</h3>
              <button
                onClick={() => {
                  setShow2FAModal(false);
                  setVerificationCode("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!verificationCode || verificationCode.length < 6 ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>

                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    {qrCode ? (
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
                  <code className="block bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono text-center">
                    {twoFactorSecret}
                  </code>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-xl tracking-widest font-mono"
                  />

                  <button
                    onClick={handleVerify2FA}
                    disabled={verificationCode.length !== 6}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify & Enable
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Disable Two-Factor Authentication</h3>
              <button
                onClick={() => {
                  setShowDisable2FAModal(false);
                  setDisable2FACode("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">Warning</p>
                <p className="text-sm text-yellow-700">
                  Disabling two-factor authentication will make your account less secure.
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Enter the 6-digit code from your authenticator app to confirm:
              </p>

              <input
                type="text"
                value={disable2FACode}
                onChange={(e) => setDisable2FACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-center text-xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisable2FAModal(false);
                  setDisable2FACode("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={disable2FACode.length !== 6}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">Warning: This action cannot be undone!</p>
                <p className="text-sm text-red-700">
                  Deleting your account will permanently remove all your data, including your profile, appointments, and messages.
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Type <strong>DELETE</strong> to confirm:
              </p>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation.toUpperCase() !== "DELETE"}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
