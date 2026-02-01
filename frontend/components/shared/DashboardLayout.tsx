'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { useAuthStore } from '@/lib/store/auth';

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <div>Loading...</div>; // Or redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role={user.role} />
      <div className="flex-1 ml-64">
        <TopHeader title={title} />
        <main className="pt-20 p-6 overflow-y-auto h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}