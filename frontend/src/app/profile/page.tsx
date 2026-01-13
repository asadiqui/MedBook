'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, User } from '@/lib/auth';
import api from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser, logout, setUser } = useAuthStore();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    specialty: '',
    consultationFee: '',
    affiliation: '',
    yearsOfExperience: '',
    clinicAddress: '',
    clinicContactPerson: '',
    clinicPhone: '',
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
        consultationFee: user.consultationFee?.toString() || '',
        affiliation: user.affiliation || '',
        yearsOfExperience: user.yearsOfExperience?.toString() || '',
        clinicAddress: user.clinicAddress || '',
        clinicContactPerson: user.clinicContactPerson || '',
        clinicPhone: user.clinicPhone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updateData: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
      };

      if (user.role === 'DOCTOR') {
        updateData.specialty = formData.specialty || undefined;
        updateData.consultationFee = formData.consultationFee ? parseFloat(formData.consultationFee) : undefined;
        updateData.affiliation = formData.affiliation || undefined;
        updateData.yearsOfExperience = formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined;
        updateData.clinicAddress = formData.clinicAddress || undefined;
        updateData.clinicContactPerson = formData.clinicContactPerson || undefined;
        updateData.clinicPhone = formData.clinicPhone || undefined;
      }

      const response = await api.patch(`/users/${user.id}`, updateData);
      setUser(response.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.post(`/users/${user.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchUser();
      setMessage({ type: 'success', text: 'Avatar updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload avatar' });
    }
  };

  const handleAvatarDelete = async () => {
    if (!user) return;

    try {
      const response = await api.delete(`/users/${user.id}/avatar`);
      await fetchUser();
      setMessage({ type: 'success', text: 'Avatar deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete avatar' });
    }
  };

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('licenseDocument', file);

    try {
      const response = await api.post(`/users/${user.id}/license-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchUser();
      setMessage({ type: 'success', text: 'License document updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload license document' });
    }
  };

  const handleLicenseDelete = async () => {
    if (!user) return;

    try {
      const response = await api.delete(`/users/${user.id}/license-document`);
      await fetchUser();
      setMessage({ type: 'success', text: 'License document deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete license document' });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
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

          {message && (
            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {/* Avatar Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-4">
              {user.avatar ? (
                <img
                  src={`${API_BASE_URL}${user.avatar}`}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-2xl font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="space-x-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Upload
                </button>
                {user.avatar && (
                  <button
                    onClick={handleAvatarDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Profile Information */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{user.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{user.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{user.phone || 'Not provided'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{user.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Doctor-specific fields */}
          {user.role === 'DOCTOR' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Doctor Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user.specialty || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user.consultationFee ? `$${user.consultationFee}` : 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="affiliation"
                      value={formData.affiliation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user.affiliation || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user.yearsOfExperience || 'Not specified'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user.clinicAddress || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Contact Person</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="clinicContactPerson"
                      value={formData.clinicContactPerson}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user.clinicContactPerson || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="clinicPhone"
                      value={formData.clinicPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{user.clinicPhone || 'Not specified'}</p>
                  )}
                </div>
              </div>

              {/* License Document */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">License Document</h3>
                {user.licenseDocument ? (
                  <div className="flex items-center space-x-4">
                    <a
                      href={`${API_BASE_URL}${user.licenseDocument}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View License Document
                    </a>
                    <button
                      onClick={handleLicenseDelete}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={licenseInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleLicenseUpload}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-600">Upload your medical license document</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isEmailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Active</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? 'Yes' : 'No'}
                </span>
              </div>
              {user.role === 'DOCTOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verified Doctor</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isVerified ? 'Yes' : 'Pending'}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Two-Factor Auth</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.isTwoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {user.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
