"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

export const dynamic = 'force-dynamic';

export default function DoctorProfilePage() {
  const { setUser, user, logout } = useAuthStore();
  const { requireAuth, accessToken, isBootstrapping } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const hasShownErrorToast = useRef(false);
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
    fetchUserData();
  }, [isBootstrapping]);

  const fetchUserData = async () => {
    // Check authentication first
    if (!requireAuth(['DOCTOR'])) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        if (!hasShownErrorToast.current) {
          hasShownErrorToast.current = true;
          const errorData = await response.json().catch(() => ({ message: 'Unauthorized' }));
          toast.error(errorData.message || 'Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 2000);
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const user = {
          id: data.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "MALE",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          bio: data.bio || "",
          avatar: data.avatar || null,
          isEmailVerified: data.isEmailVerified || false,
          isActive: data.isActive || true,
          isOAuth: data.isOAuth || false,
          role: data.role || "DOCTOR",
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
          createdAt: data.createdAt || "",
          lastLoginAt: data.lastLoginAt || "",
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
        setUser(user); // Set user in global store
        setEditData({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          bio: user.bio,
          avatar: user.avatar,
          specialty: user.specialty,
          licenseNumber: user.licenseNumber,
          licenseDocument: user.licenseDocument,
          consultationFee: user.consultationFee,
          affiliation: user.affiliation,
          yearsOfExperience: user.yearsOfExperience,
          clinicAddress: user.clinicAddress,
          clinicContactPerson: user.clinicContactPerson,
          clinicPhone: user.clinicPhone,
        });
        setIsOAuthUser(data.isOAuth || false);
        setSecurityData({
          lastPasswordChange: "2 months ago",
          twoFactorEnabled: data.isTwoFactorEnabled || false,
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/avatar`,
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
      toast.error("Failed to upload avatar");
    }
  };


  const handleAvatarUploadWrapper = (file: File) => {
    // Create a synthetic event to match the expected signature
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
      if (editData.consultationFee) updateData.consultationFee = editData.consultationFee;
      if (editData.affiliation) updateData.affiliation = editData.affiliation;
      if (editData.yearsOfExperience) updateData.yearsOfExperience = editData.yearsOfExperience;
      if (editData.clinicAddress) updateData.clinicAddress = editData.clinicAddress;
      if (editData.clinicContactPerson) updateData.clinicContactPerson = editData.clinicContactPerson;
      if (editData.clinicPhone) updateData.clinicPhone = editData.clinicPhone;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
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
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleDataChange = (data: Partial<typeof editData>) => {
    setEditData({ ...editData, ...data });
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (response.ok) {
        setShowChangePasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("Password changed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    if (!user) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Account deleted successfully");
        logout();
        setTimeout(() => window.location.href = "/auth/login", 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Failed to delete account");
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
            accessToken={accessToken}
            onPasswordChangeClick={() => setShowChangePasswordModal(true)}
            on2FAStatusChange={(enabled) => setSecurityData({ ...securityData, twoFactorEnabled: enabled })}
          />

          {/* Preferences */}
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

      {/* Change Password Modal */}
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
    </DashboardLayout>
  );
}
