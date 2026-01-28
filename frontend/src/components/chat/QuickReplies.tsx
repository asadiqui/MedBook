'use client';

import { useAuthStore } from '@/lib/auth';

interface QuickRepliesProps {
  onSelectReply: (message: string) => void;
}

export default function QuickReplies({ onSelectReply }: QuickRepliesProps) {
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  const patientReplies = [
    'Request Refill',
    'Share Lab Results',
    'Side Effects?',
  ];

  const doctorReplies = [
    'Please schedule an appointment',
    "I've received your results",
    'Take care',
  ];

  const replies = isDoctor ? doctorReplies : patientReplies;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 border-t border-gray-100 bg-white">
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelectReply(reply)}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
