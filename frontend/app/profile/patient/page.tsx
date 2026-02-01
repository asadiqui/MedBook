"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthStore } from "@/lib/store/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { PersonalInfo } from "@/components/profile/PersonalInfoView";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { AccountStats } from "@/components/profile/AccountStats";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { DeleteAccountModal } from "@/components/profile/DeleteAccountModal";
import { resolveAvatarUrl } from "@/lib/utils/avatar";

export const dynamic = 'force-dynamic';

export default function PatientProfilePage() {
  const { setUser, user, logout } = useAuthStore();
  const { requireAuth, accessToken, isBootstrapping } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const hasShownErrorToast = useRef(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
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

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "MALE" as string,
    dateOfBirth: "",
    avatar: null as string | null,
  });

  const [securityData, setSecurityData] = useState({
    lastPasswordChange: "3 months ago",
    twoFactorEnabled: false,
  });

  useEffect(() => {
    if (isBootstrapping) return;
    fetchUserData();
  }, [isBootstrapping]);

  const fetchUserData = async () => {
    // Check authentication first
    if (!requireAuth(['PATIENT'])) {
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
        setUser(data); // Set full user in store
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
        setUserData(user);
        setEditData({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          avatar: user.avatar,
        });
        setIsOAuthUser(data.isOAuth || false);
        setSecurityData({
          lastPasswordChange: "3 months ago",
          twoFactorEnabled: data.isTwoFactorEnabled || false,
        });
      } else {
        // If unauthorized, clear tokens and redirect
        logout();
        window.location.href = "/auth/login";
      }
    } catch (error) {
      // Clear tokens on error and redirect
      logout();
      window.location.href = "/auth/login";
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
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
        
        // Update avatar immediately in state
        const newAvatar = data.avatar;
        
        setUserData(prev => ({ ...prev, avatar: newAvatar }));
        setEditData(prev => ({ ...prev, avatar: newAvatar }));
        
        // Also refresh user data from server to be sure
        await fetchUserData();
        
        toast.success("Avatar uploaded successfully!");
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(`Failed to upload avatar: ${errorData?.message || response.statusText}`);
      }
    } catch (error: any) {
      toast.error(`Failed to upload avatar: ${error.message || 'Network error'}`);
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

    try {
      // Prepare update data, filtering out empty values
      const updateData: any = {
        firstName: editData.firstName,
        lastName: editData.lastName,
      };

      if (editData.phone) updateData.phone = editData.phone;
      if (editData.gender) updateData.gender = editData.gender;
      if (editData.dateOfBirth) updateData.dateOfBirth = editData.dateOfBirth;

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
        setUserData((prev) => ({ ...prev, ...editData }));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
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
            resolveAvatarUrl(avatar, { cacheBust: true })
          }
        />

        <AccountStats userData={userData} />

        <SecuritySettings
          isOAuthUser={isOAuthUser}
          twoFactorEnabled={securityData.twoFactorEnabled}
          lastPasswordChange={securityData.lastPasswordChange}
          accessToken={accessToken}
          onPasswordChangeClick={() => setShowChangePasswordModal(true)}
          on2FAStatusChange={handle2FAStatusChange}
        />

        {/* Danger Zone */}
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
        accessToken={accessToken}
        onPasswordChanged={handlePasswordChanged}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        accessToken={accessToken}
        userId={user?.id}
        onAccountDeleted={handleLogout}
      />
    </DashboardLayout>
  );
}
