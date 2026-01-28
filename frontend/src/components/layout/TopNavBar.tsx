'use client';

import { Search, Bell, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

export default function TopNavBar() {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      {/* Search Bar (Doctor View) */}
      {isDoctor && (
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients, messages..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      )}

      {/* Empty space for patient view */}
      {!isDoctor && <div className="flex-1" />}

      {/* Right side - Notifications and User */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Help */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {isDoctor ? 'Doctor' : 'Patient Account'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="text-blue-600 font-semibold text-sm">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
