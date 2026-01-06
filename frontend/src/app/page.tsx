'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { useEffect } from 'react';

export default function Home() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-primary-600 mb-4">
          MedBook
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Doctor Appointment Booking Platform
        </p>

        {isAuthenticated && user ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <p className="text-lg text-gray-700">
              Welcome back, <span className="font-semibold">{user.firstName} {user.lastName}</span>!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Role: <span className="font-medium">{user.role}</span>
            </p>
            <div className="mt-4 space-x-4">
              <Link
                href="/profile"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 text-lg font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-block border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 text-lg font-medium"
            >
              Register
            </Link>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">For Patients</h3>
            <p className="text-gray-600 text-sm">
              Browse doctors, book appointments, and manage your health easily.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">For Doctors</h3>
            <p className="text-gray-600 text-sm">
              Manage your availability, approve appointments, and grow your practice.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time</h3>
            <p className="text-gray-600 text-sm">
              Get instant notifications when appointments are confirmed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
