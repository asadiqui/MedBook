'use client';

import { useAuthStore } from '@/lib/auth';
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
                src={otherUser.avatar}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-semibold">
                {otherUser.firstName[0]}{otherUser.lastName[0]}
              </span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            {isOtherDoctor ? 'Dr. ' : ''}{otherUser.firstName} {otherUser.lastName}
          </h2>
          <p className="text-sm text-green-600">
            {isTyping ? 'Typing...' : isOtherDoctor ? 'Online • General Practitioner' : 'Online'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isDoctor ? (
          <>
            {/* Doctor view actions */}
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
              <Video className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Info className="w-5 h-5" />
              <span className="text-sm font-medium">Patient Info</span>
            </button>
          </>
        ) : (
          <>
            {/* Patient view actions */}
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
              <Info className="w-5 h-5" />
            </button>
            <Link
              href={`/booking?doctorId=${otherUser.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Book Appointment</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
