"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthStore } from "@/lib/store/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { AccountStats } from "@/components/profile/AccountStats";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { DeleteAccountModal } from "@/components/profile/DeleteAccountModal";
import { resolveAvatarUrl } from "@/lib/utils/avatar";
import api from "@/lib/api";

export const dynamic = 'force-dynamic';

export default function PatientProfilePage() {
  const { user, logout, checkAuth } = useAuthStore();
  const { requireAuth, isBootstrapping } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "" as string,
    dateOfBirth: "",
    avatar: null as string | null,
    createdAt: "",
    isEmailVerified: false,
    lastLoginAt: "",
  });

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "" as string,
    dateOfBirth: "",
    avatar: null as string | null,
  });

  const [securityData, setSecurityData] = useState({
    lastPasswordChange: "3 months ago",
    twoFactorEnabled: false,
  });

  useEffect(() => {
    if (isBootstrapping) return;
    
    const authResult = requireAuth(['PATIENT']);

    if (authResult === null) return;

    if (authResult === false) {
      setLoading(false);
      return;
    }

    if (user) {
      const userData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
        avatar: user.avatar || null,
        createdAt: user.createdAt || "",
        isEmailVerified: user.isEmailVerified || false,
        lastLoginAt: user.lastLoginAt || "",
      };

      setUserData(userData);
      setEditData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        avatar: userData.avatar,
      });

      setIsOAuthUser(user.isOAuth || false);
      setSecurityData({
        lastPasswordChange: "3 months ago",
        twoFactorEnabled: user.isTwoFactorEnabled || false,
      });
    }

    setLoading(false);
  }, [isBootstrapping, user]);

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.post(`/users/${user.id}/avatar`, formData);

      const data = response.data;
      

      const newAvatar = data.avatar;
      
      setUserData(prev => ({ ...prev, avatar: newAvatar }));
      setEditData(prev => ({ ...prev, avatar: newAvatar }));
      

      await checkAuth();
      
      toast.success("Avatar uploaded successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      toast.error(`Failed to upload avatar: ${errorMessage}`);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        avatar: userData.avatar,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (editData.dateOfBirth) {
      console.log("Validating date:", editData.dateOfBirth);
      
      // Validate the date is actually valid (catches Feb 31, etc.)
      const birthDate = new Date(editData.dateOfBirth);
      console.log("Parsed date:", birthDate, "isNaN:", isNaN(birthDate.getTime()));
      
      if (isNaN(birthDate.getTime())) {
        toast.error("Please enter a valid date");
        return;
      }
      
      const [year, month, day] = editData.dateOfBirth.split('-').map(Number);
      console.log("Input parts:", { year, month, day });
      console.log("Parsed parts:", { 
        year: birthDate.getFullYear(), 
        month: birthDate.getMonth() + 1, 
        day: birthDate.getDate() 
      });
      
      if (birthDate.getFullYear() !== year || 
          birthDate.getMonth() !== month - 1 || 
          birthDate.getDate() !== day) {
        console.log("Date validation failed - auto-corrected date detected");
        toast.error("Invalid date. Please check the day is valid for that month (e.g., February only has 28/29 days)");
        return;
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        toast.error("You must be at least 18 years old");
        return;
      }
    }

    try {

      const updateData: any = {
        firstName: editData.firstName,
        lastName: editData.lastName,
      };

      if (editData.phone) updateData.phone = editData.phone;
      if (editData.gender) updateData.gender = editData.gender;
      if (editData.dateOfBirth) updateData.dateOfBirth = editData.dateOfBirth;

      await api.patch(`/users/${user.id}`, updateData);

      setUserData((prev) => ({ ...prev, ...editData }));
      setIsEditing(false);
      await checkAuth();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handle2FAStatusChange = (enabled: boolean) => {
    setSecurityData({ ...securityData, twoFactorEnabled: enabled });
  };

  const handlePasswordChanged = () => {
    setSecurityData({ ...securityData, lastPasswordChange: "Just now" });
  };

  const handleDataChange = (data: Partial<typeof editData>) => {
    setEditData(prev => ({ ...prev, ...data }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title="Account Settings">
      <div className="p-8 max-w-4xl mx-auto">
        <PersonalInfo
          userData={userData}
          editData={editData}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          onSave={handleSaveProfile}
          onDataChange={handleDataChange}
          onAvatarUpload={handleAvatarUpload}
          getAvatarUrl={(avatar: string | null | undefined) =>
            resolveAvatarUrl(avatar)
          }
        />

        <AccountStats userData={userData} />

        <SecuritySettings
          isOAuthUser={isOAuthUser}
          twoFactorEnabled={securityData.twoFactorEnabled}
          lastPasswordChange={securityData.lastPasswordChange}
          onPasswordChangeClick={() => setShowChangePasswordModal(true)}
          on2FAStatusChange={handle2FAStatusChange}
        />

        {}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
            <p className="text-sm text-gray-600">Irreversible and destructive actions.</p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-4">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Delete Account</h3>
                  <p className="text-xs text-gray-600">Permanently delete your account and all associated data.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onPasswordChanged={handlePasswordChanged}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userId={user?.id}
        onAccountDeleted={handleLogout}
      />
    </DashboardLayout>
  );
}
