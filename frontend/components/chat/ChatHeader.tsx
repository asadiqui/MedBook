'use client';

import { useAuthStore } from '@/lib/store/auth';
import { resolveAvatarUrl } from '@/lib/utils/avatar';
import { getInitials } from '@/lib/utils/formatting';
import { Phone, Video, Info, Calendar } from 'lucide-react';
import Link from 'next/link';

interface OtherUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
}

interface ChatHeaderProps {
  otherUser: OtherUser;
  isTyping: boolean;
  bookingId: string;
}

export default function ChatHeader({ otherUser, isTyping, bookingId }: ChatHeaderProps) {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';
  const isOtherDoctor = otherUser.role === 'DOCTOR';

  return (
    <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      {/* User Info */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            {otherUser.avatar ? (
              <img
                src={resolveAvatarUrl(otherUser.avatar)}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-semibold">
                {getInitials(otherUser.firstName, otherUser.lastName)}
              </span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            {isOtherDoctor ? 'Dr. ' : ''}{otherUser.firstName} {otherUser.lastName}
          </h2>
            {isTyping ? (
              <p className="text-sm text-green-600">Typing...</p>
            ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isDoctor ? (
          <></>
        ) : null}
      </div>
    </div>
  );
}
