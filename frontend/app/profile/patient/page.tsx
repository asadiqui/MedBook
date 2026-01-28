"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, Mail, Phone, Camera, Lock, Shield, 
  Bell, Trash2, LogOut, Edit2, X, Check, Calendar
} from "lucide-react";
import toast from "react-hot-toast";

export default function PatientProfilePage() {
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
    avatar: null as string | null,
    createdAt: "",
    isEmailVerified: false,
    lastLoginAt: "",
  });

  const [editData, setEditData] = useState({ ...userData });

  const [securityData, setSecurityData] = useState({
    lastPasswordChange: "3 months ago",
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
        console.log("Fetched user data:", data);
        const user = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "MALE",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          avatar: data.avatar || null,
          createdAt: data.createdAt || "",
          isEmailVerified: data.isEmailVerified || false,
          lastLoginAt: data.lastLoginAt || "",
        };
        console.log("Setting avatar in state:", user.avatar);
        setUserData(user);
        setEditData(user);
        setIsOAuthUser(data.isOAuth || false);
        setSecurityData({
          lastPasswordChange: "3 months ago",
          twoFactorEnabled: data.isTwoFactorEnabled || false,
        });
      } else {
        // If unauthorized, clear tokens and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Clear tokens on error and redirect
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth/login";
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
        console.log("Avatar upload response:", data);
        
        // Update avatar immediately in state
        const newAvatar = data.avatar;
        console.log("New avatar path:", newAvatar);
        
        setUserData(prev => ({ ...prev, avatar: newAvatar }));
        setEditData(prev => ({ ...prev, avatar: newAvatar }));
        
        // Also refresh user data from server to be sure
        await fetchUserData();
        
        toast.success("Avatar uploaded successfully!");
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("Avatar upload failed:", response.status, errorData);
        toast.error(`Failed to upload avatar: ${errorData?.message || response.statusText}`);
      }
    } catch (error: any) {
      console.error("Failed to upload avatar:", error);
      toast.error(`Failed to upload avatar: ${error.message || 'Network error'}`);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({ ...userData });
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
        setUserData({ ...editData });
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
    // If it's a relative path from our backend, prepend the base URL (not API URL) and add cache-busting
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}${avatar}?t=${Date.now()}`;
    console.log('Avatar URL:', avatar, '-> Full URL:', fullUrl);
    return fullUrl;
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
        // Immediately clear tokens and redirect - no alert needed
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        toast.success("Account deleted successfully");
        setTimeout(() => window.location.href = "/auth/login", 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete account");
      }
    } catch (error: any) {
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
            href="/find-doctor"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <User className="h-5 w-5" />
            Find Doctor
          </Link>
          <Link
            href="/appointments"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <Calendar className="h-5 w-5" />
            My Appointments
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
            href="/profile/patient"
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
        <header className="bg-white border-b border-gray-200 py-6 pl-6 pr-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your personal information and security</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                  <p className="font-medium text-gray-900">{userData.firstName} {userData.lastName}</p>
                  <p className="text-gray-500">Patient</p>
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
                  <label
                    htmlFor="avatar-upload"
                    className={`absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full transition shadow-lg ${
                      isEditing ? 'cursor-pointer hover:bg-blue-700' : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    {isEditing && (
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    )}
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Profile Picture</h3>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF. Max 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Full Name */}
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
                    <p className="text-sm text-gray-900 font-medium">{userData.firstName} {userData.lastName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">EMAIL ADDRESS</label>
                  <p className="text-sm text-gray-900">{userData.email}</p>
                </div>

                {/* Phone Number */}
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

                {/* Gender */}
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

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">DATE OF BIRTH</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Email Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${userData.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {userData.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Login</span>
                    <span className="text-gray-900 font-medium">
                      {userData.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Member since</span>
                    <span className="text-gray-900 font-medium">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </span>
                  </div>
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
              {/* Password */}
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

              {/* Two-Factor Authentication */}
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

            <div className="p-6">
              {/* Delete Account */}
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
