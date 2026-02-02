"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthStore } from "@/lib/store/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { DoctorPersonalInfo } from "@/components/profile/DoctorPersonalInfo";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { DoctorAccountStats } from "@/components/profile/DoctorAccountStats";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { DeleteAccountModal } from "@/components/profile/DeleteAccountModal";
import { resolveAvatarUrl } from "@/lib/utils/avatar";
import api from "@/lib/api";

export const dynamic = 'force-dynamic';

export default function DoctorProfilePage() {
  const { user, logout, checkAuth } = useAuthStore();
  const { requireAuth, isBootstrapping } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE" as string,
    dateOfBirth: "",
    bio: "",
    avatar: null as string | null,
    isEmailVerified: false,
    createdAt: "",
    lastLoginAt: "",
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

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "MALE" as string,
    dateOfBirth: "",
    bio: "",
    avatar: null as string | null,
    specialty: "",
    licenseNumber: "",
    licenseDocument: null as string | null,
    consultationFee: 0,
    affiliation: "",
    yearsOfExperience: 0,
    clinicAddress: "",
    clinicContactPerson: "",
    clinicPhone: "",
  });

  const [securityData, setSecurityData] = useState({
    lastPasswordChange: "2 months ago",
    twoFactorEnabled: false,
  });

  useEffect(() => {
    if (isBootstrapping) return;
    
    const authResult = requireAuth(['DOCTOR']);

    if (authResult !== true) {
      if (authResult === false) {
        setLoading(false);
      }
      return;
    }

    if (user) {
      const userData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "MALE",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
        bio: user.bio || "",
        avatar: user.avatar || null,
        isEmailVerified: user.isEmailVerified || false,
        createdAt: user.createdAt || "",
        lastLoginAt: user.lastLoginAt || "",
      };

      setUserData(userData);
      setDoctorData({
        specialty: user.specialty || "",
        licenseNumber: user.licenseNumber || "",
        licenseDocument: user.licenseDocument || null,
        consultationFee: user.consultationFee || 0,
        affiliation: user.affiliation || "",
        yearsOfExperience: user.yearsOfExperience || 0,
        clinicAddress: user.clinicAddress || "",
        clinicContactPerson: user.clinicContactPerson || "",
        clinicPhone: user.clinicPhone || "",
        isVerified: user.isVerified || false,
      });

      setEditData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        bio: userData.bio,
        avatar: userData.avatar,
        specialty: user.specialty || "",
        licenseNumber: user.licenseNumber || "",
        licenseDocument: user.licenseDocument || null,
        consultationFee: user.consultationFee || 0,
        affiliation: user.affiliation || "",
        yearsOfExperience: user.yearsOfExperience || 0,
        clinicAddress: user.clinicAddress || "",
        clinicContactPerson: user.clinicContactPerson || "",
        clinicPhone: user.clinicPhone || "",
      });

      setIsOAuthUser(user.isOAuth || false);
      setSecurityData({
        lastPasswordChange: "2 months ago",
        twoFactorEnabled: user.isTwoFactorEnabled || false,
      });
    }

    setLoading(false);
  }, [isBootstrapping, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await api.post(`/users/${user.id}/avatar`, formData);

      await checkAuth();
      toast.success("Avatar uploaded successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to upload avatar";
      toast.error(errorMessage);
    }
  };

  const handleAvatarUploadWrapper = (file: File) => {

    const syntheticEvent = {
      target: { files: [file] }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleAvatarUpload(syntheticEvent);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        bio: userData.bio,
        avatar: userData.avatar,
        specialty: doctorData.specialty,
        licenseNumber: doctorData.licenseNumber,
        licenseDocument: doctorData.licenseDocument,
        consultationFee: doctorData.consultationFee,
        affiliation: doctorData.affiliation,
        yearsOfExperience: doctorData.yearsOfExperience,
        clinicAddress: doctorData.clinicAddress,
        clinicContactPerson: doctorData.clinicContactPerson,
        clinicPhone: doctorData.clinicPhone,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {

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
      if (editData.consultationFee) updateData.consultationFee = editData.consultationFee;
      if (editData.affiliation) updateData.affiliation = editData.affiliation;
      if (editData.yearsOfExperience) updateData.yearsOfExperience = editData.yearsOfExperience;
      if (editData.clinicAddress) updateData.clinicAddress = editData.clinicAddress;
      if (editData.clinicContactPerson) updateData.clinicContactPerson = editData.clinicContactPerson;
      if (editData.clinicPhone) updateData.clinicPhone = editData.clinicPhone;

      await api.patch(`/users/${user.id}`, updateData);

      setUserData((prev) => ({
        ...prev,
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        gender: editData.gender,
        dateOfBirth: editData.dateOfBirth,
        bio: editData.bio,
        avatar: editData.avatar,
      }));
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
      await checkAuth();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handleDataChange = (data: Partial<typeof editData>) => {
    setEditData({ ...editData, ...data });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setShowChangePasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    if (!user) return;

    try {
      await api.delete(`/users/${user.id}`);

      toast.success("Account deleted successfully");
      logout();
      setTimeout(() => window.location.href = "/auth/login", 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete account";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title="Doctor Profile">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      ) : (
        <div className="p-8 max-w-4xl mx-auto">
          <DoctorPersonalInfo
            userData={userData}
            doctorData={doctorData}
            editData={editData}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
            onSave={handleSaveProfile}
            onDataChange={handleDataChange}
            onAvatarUpload={handleAvatarUploadWrapper}
            getAvatarUrl={(avatar) => resolveAvatarUrl(avatar, { cacheBust: true })}
          />

          <DoctorAccountStats userData={userData} doctorData={doctorData} />

          <SecuritySettings
            isOAuthUser={isOAuthUser}
            twoFactorEnabled={securityData.twoFactorEnabled}
            lastPasswordChange={securityData.lastPasswordChange}
            onPasswordChangeClick={() => setShowChangePasswordModal(true)}
            on2FAStatusChange={(enabled) => setSecurityData({ ...securityData, twoFactorEnabled: enabled })}
          />

          {}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            </div>

            <div className="p-6 space-y-4">
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
      )}

      {}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {}
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
    </DashboardLayout>
  );
}
