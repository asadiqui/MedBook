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

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSendEmailVerification = async () => {
    try {
      await api.post('/auth/email/send-verification');
      setMessage({ type: 'success', text: 'Verification email has been sent to your email address!' });
    } catch (error) {
      console.error('Error sending verification email:', error);
      setMessage({ type: 'error', text: 'Failed to send verification email. Please try again.' });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password.' });
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await api.post('/auth/2fa/enable');
      setQrCodeUrl(response.data.qrCodeUrl);
      setSecret(response.data.secret);
      setShow2FASetup(true);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      alert('Failed to enable 2FA. Please try again.');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post('/auth/2fa/verify', { code: twoFactorCode });
      setShow2FASetup(false);
      setTwoFactorCode('');
      setQrCodeUrl('');
      setSecret('');
      // Refresh user data to update 2FA status
      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      alert('2FA enabled successfully!');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('Invalid code. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }
    
    try {
      await api.post('/auth/2fa/disable');
      // Refresh user data to update 2FA status
      const userResponse = await api.get('/users/me');
      setUser(userResponse.data);
      alert('2FA disabled successfully!');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('Failed to disable 2FA. Please try again.');
    }
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
                  src={user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`}
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

          {/* Security Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
            
            {/* Email Verification */}
            {!user.isEmailVerified && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please verify your email address to secure your account.
                    </p>
                  </div>
                  <button
                    onClick={handleSendEmailVerification}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                  >
                    Send Verification Email
                  </button>
                </div>
              </div>
            )}

            {/* Password Change - Only for non-OAuth users */}
            {!user.isOAuth && (
              <div className="mb-6 bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">
                      Update your account password
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {showPasswordChange ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {showPasswordChange && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePasswordChange}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Two-Factor Authentication */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                {!user.isTwoFactorEnabled ? (
                  <button
                    onClick={handleEnable2FA}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Enable 2FA
                  </button>
                ) : (
                  <button
                    onClick={handleDisable2FA}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Disable 2FA
                  </button>
                )}
              </div>

              {show2FASetup && (
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Setup Instructions</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                      <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                      <li>Scan the QR code below with your app</li>
                      <li>Enter the 6-digit code from your app</li>
                    </ol>
                  </div>
                  
                  {qrCodeUrl && (
                    <div className="mb-4 flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code" className="border rounded" />
                    </div>
                  )}
                  
                  {secret && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Or manually enter this code:</p>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{secret}</code>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleVerify2FA}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
