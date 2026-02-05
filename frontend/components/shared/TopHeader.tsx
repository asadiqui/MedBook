'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { resolveAvatarUrl } from '@/lib/utils/avatar';

interface TopHeaderProps {
  title: string;
}

export function TopHeader({ title }: TopHeaderProps) {
  const { user } = useAuthStore();
  const profileHref = user?.role === 'DOCTOR'
    ? '/profile/doctor'
    : user?.role === 'PATIENT'
      ? '/profile/patient'
      : '/admin/dashboard';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between fixed top-0 left-64 right-0 z-10">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
          <Bell className="h-5 w-5" />
        </button>

        <Link
          href={profileHref}
          className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-gray-50"
        >
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
          </div>
          {resolveAvatarUrl(user?.avatar) ? (
            <img
              src={resolveAvatarUrl(user?.avatar)}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                console.error('Failed to load avatar:', user?.avatar);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}