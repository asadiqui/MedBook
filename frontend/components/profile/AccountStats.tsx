"use client";

import { Mail, Clock, Calendar } from "lucide-react";

interface AccountStatsProps {
  userData: {
    isEmailVerified: boolean;
    lastLoginAt: string;
    createdAt: string;
  };
}

export const AccountStats: React.FC<AccountStatsProps> = ({ userData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Account Overview</h2>
        <p className="text-sm text-gray-600">Your account status and activity.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Email Status */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${userData.isEmailVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Mail className={`h-5 w-5 ${userData.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Email Status</p>
            <p className={`text-sm font-semibold ${userData.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {userData.isEmailVerified ? 'Verified' : 'Not Verified'}
            </p>
          </div>

          {/* Last Login */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Last Login</p>
            <p className="text-sm font-semibold text-gray-900">
              {userData.lastLoginAt ? new Date(userData.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </p>
          </div>

          {/* Member Since */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Member Since</p>
            <p className="text-sm font-semibold text-gray-900">
              {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};