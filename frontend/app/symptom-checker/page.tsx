'use client';

import { useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/lib/hooks/useAuth';
import AiChatWidget from '@/components/ai/AiChatWidget';

export default function SymptomCheckerPage() {
  const { requireAuth, isBootstrapping, user } = useAuth();

  useEffect(() => {
    if (isBootstrapping) return;
    requireAuth(['PATIENT']);
  }, [isBootstrapping, requireAuth]);

  if (isBootstrapping || !user) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title="Symptom Checker">
      <div className="flex flex-col h-[calc(100vh-8rem)]"> 
        <div className="mb-6">
           {/* <h1 className="text-2xl font-bold text-gray-900">Symptom Checker</h1> */}
           <p className="text-gray-600">Describe your symptoms below and our AI assistant will create a summary for your doctor.</p>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <AiChatWidget mode="embedded" agentId="llm" title="Symptom Checker Assistant" />
        </div>
      </div>
    </DashboardLayout>
  );
}
