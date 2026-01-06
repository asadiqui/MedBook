'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, User } from '@/lib/auth';
import api from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser, logout, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    specialty: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Only fetch user if we have a token but no user data (e.g., after page hard refresh)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user && !isLoading) {
      fetchUser();
    }
  }, [fetchUser, user, isLoading]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        specialty: user.specialty || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await api.patch(`/users/${user?.id}`, formData);
      setUser(response.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const avatarFormData = new FormData();
    avatarFormData.append('avatar', file);

    try {
      const response = await api.post(`/users/${user?.id}/avatar`, avatarFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Only update the avatar field, keep other user data
      if (user) {
        setUser({ ...user, avatar: response.data.avatar });
      }
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload avatar' 
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Sign out
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center">
              <div
                onClick={handleAvatarClick}
                className="relative cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={`${API_BASE_URL}${user.avatar}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary-600">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">Change</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="ml-6 text-white">
                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-primary-100">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 py-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {user.role === 'DOCTOR' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialty
                    </label>
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">First Name</label>
                    <p className="mt-1 text-gray-900">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Name</label>
                    <p className="mt-1 text-gray-900">{user.lastName}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-gray-900">{user.phone || 'Not set'}</p>
                </div>
                {user.role === 'DOCTOR' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Specialty</label>
                      <p className="mt-1 text-gray-900">{user.specialty || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">License Number</label>
                      <p className="mt-1 text-gray-900">{user.licenseNumber || 'Not set'}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Bio</label>
                  <p className="mt-1 text-gray-900">{user.bio || 'No bio yet'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Member since</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSaving ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Change Password
            </button>
          )}
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Account Status:</span>
              <span className={`ml-2 font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Email Verified:</span>
              <span className={`ml-2 font-medium ${user.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {user.isEmailVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">2FA Enabled:</span>
              <span className={`ml-2 font-medium ${user.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {user.isTwoFactorEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            {user.role === 'DOCTOR' && (
              <div>
                <span className="text-gray-500">Verified Doctor:</span>
                <span className={`ml-2 font-medium ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.isVerified ? 'Yes' : 'Pending'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
