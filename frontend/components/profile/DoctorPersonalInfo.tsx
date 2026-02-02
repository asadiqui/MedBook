"use client";

import { User, Camera, Edit2, X, Check, Briefcase, FileText, DollarSign, MapPin, Award, Clock, Phone } from "lucide-react";
import { FileUpload } from "../shared/FileUpload";

interface DoctorPersonalInfoProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    bio: string;
    avatar: string | null;
    createdAt: string;
    isEmailVerified: boolean;
    lastLoginAt: string;
  };
  doctorData: {
    specialty: string;
    licenseNumber: string;
    licenseDocument: string | null;
    consultationFee: number;
    affiliation: string;
    yearsOfExperience: number;
    clinicAddress: string;
    clinicContactPerson: string;
    clinicPhone: string;
    isVerified: boolean;
  };
  editData: {
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    bio: string;
    avatar: string | null;
    specialty: string;
    licenseNumber: string;
    licenseDocument: string | null;
    consultationFee: number;
    affiliation: string;
    yearsOfExperience: number;
    clinicAddress: string;
    clinicContactPerson: string;
    clinicPhone: string;
  };
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onDataChange: (data: Partial<DoctorPersonalInfoProps['editData']>) => void;
  onAvatarUpload: (file: File) => void;
  getAvatarUrl: (avatar: string | null) => string | undefined;
}

export const DoctorPersonalInfo: React.FC<DoctorPersonalInfoProps> = ({
  userData,
  doctorData,
  editData,
  isEditing,
  onEditToggle,
  onSave,
  onDataChange,
  onAvatarUpload,
  getAvatarUrl,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-600">Update your photo and professional details.</p>
        </div>
        {!isEditing ? (
          <button
            onClick={onEditToggle}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onEditToggle}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-6">
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
                  {userData.firstName?.[0] || ""}
                  {userData.lastName?.[0] || ""}
                </span>
              </div>
            )}
            {isEditing && (
              <div className="absolute -bottom-1 -right-1">
                <FileUpload
                  onFileSelect={onAvatarUpload}
                  accept="image/*"
                  id="avatar-upload"
                  label={<Camera className="h-3.5 w-3.5" />}
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Profile Picture</h3>
            <p className="text-xs text-gray-600">JPG, GIF or PNG. 1MB max.</p>
            {doctorData.isVerified && (
              <div className="mt-1 flex items-center text-green-600 text-xs font-medium">
                <Check className="w-3 h-3 mr-1" />
                Verified Doctor
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">First Name</p>
                <p className="text-lg font-semibold text-gray-900">{userData.firstName}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Name</p>
                <p className="text-lg font-semibold text-gray-900">{userData.lastName}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900 truncate">{userData.email}</p>
                  {userData.isEmailVerified && <Check className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userData.phone || <span className="text-gray-400 italic">Not set</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {userData.gender ? userData.gender.toLowerCase() : <span className="text-gray-400 italic">Not set</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</p>
                <p className="text-lg font-semibold text-gray-900">
                  {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">{userData.bio || "No bio provided"}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Specialty
            </label>
            <p className="text-lg font-semibold text-gray-900">{doctorData.specialty || "Not specified"}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Award className="w-4 h-4 inline mr-1" />
              License Number
            </label>
            <p className="text-lg font-semibold text-gray-900">{doctorData.licenseNumber || "Not provided"}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Consultation Fee ($)
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {doctorData.consultationFee ? `$${doctorData.consultationFee}` : "Not set"}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Years of Experience
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {doctorData.yearsOfExperience ? `${doctorData.yearsOfExperience} years` : "Not specified"}
            </p>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Affiliation
            </label>
            <p className="text-lg font-semibold text-gray-900">{doctorData.affiliation || "Not specified"}</p>
          </div>

          <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Clinic Address
            </label>
            <p className="text-lg font-semibold text-gray-900">{doctorData.clinicAddress || "Not provided"}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Clinic Contact Person
            </label>
            <p className="text-lg font-semibold text-gray-900">{doctorData.clinicContactPerson || "Not provided"}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Clinic Phone
            </label>
            <p className="text-lg font-semibold text-gray-900">{doctorData.clinicPhone || "Not provided"}</p>
          </div>

          </div>
        )}

        {isEditing && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => onDataChange({ firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => onDataChange({ lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => onDataChange({ phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={editData.gender}
                  onChange={(e) => onDataChange({ gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={editData.dateOfBirth}
                  onChange={(e) => onDataChange({ dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => onDataChange({ bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <input
                  type="text"
                  value={editData.specialty}
                  onChange={(e) => onDataChange({ specialty: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  type="text"
                  value={editData.licenseNumber}
                  onChange={(e) => onDataChange({ licenseNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($)</label>
                <input
                  type="number"
                  value={editData.consultationFee}
                  onChange={(e) => onDataChange({ consultationFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={editData.yearsOfExperience}
                  onChange={(e) => onDataChange({ yearsOfExperience: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Affiliation</label>
                <input
                  type="text"
                  value={editData.affiliation}
                  onChange={(e) => onDataChange({ affiliation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
                <textarea
                  value={editData.clinicAddress}
                  onChange={(e) => onDataChange({ clinicAddress: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Contact Person</label>
                <input
                  type="text"
                  value={editData.clinicContactPerson}
                  onChange={(e) => onDataChange({ clinicContactPerson: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Phone</label>
                <input
                  type="tel"
                  value={editData.clinicPhone}
                  onChange={(e) => onDataChange({ clinicPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};