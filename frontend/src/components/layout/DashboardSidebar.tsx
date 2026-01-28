'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import {
  LayoutDashboard,
  Search,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  FileText,
  Stethoscope,
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  const patientLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/booking', label: 'Find Doctor', icon: Search },
    { href: '/appointments', label: 'My Appointments', icon: Calendar },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const doctorLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { href: '/patients', label: 'Patients', icon: Users },
    { href: '/chat', label: 'Messages', icon: MessageSquare },
    { href: '/lab-results', label: 'Lab Results', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Doctor Profile Header (Doctor View) or Logo (Patient View) */}
      {isDoctor && user ? (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-blue-600 font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Dr. {user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.specialty || 'Cardiology Specialist'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Sa7ti</span>
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
              {link.label === 'Messages' && isActive && (
                <span className="ml-auto bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{isDoctor ? 'Logout' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
}
