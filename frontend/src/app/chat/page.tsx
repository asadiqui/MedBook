'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatLayout from '@/components/ChatLayout';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(
    bookingIdParam || undefined
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatLayout
        selectedBookingId={selectedBookingId}
        onSelectChat={setSelectedBookingId}
      />
    </div>
  );
}
