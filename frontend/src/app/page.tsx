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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
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
              {user.role === 'DOCTOR' && (
                <Link
                  href="/availability"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Manage Availability
                </Link>
              )}
              {user.role === 'PATIENT' && (
                <Link
                  href="/booking"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Book Appointment
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Admin Dashboard
                </Link>
              )}
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
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 font-bold text-xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">For Patients</h3>
            <p className="text-gray-600 text-sm">
              Browse doctors, book appointments, and manage your health easily.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 font-bold text-xl">👨‍⚕️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">For Doctors</h3>
            <p className="text-gray-600 text-sm">
              Manage your availability, approve appointments, and grow your practice.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 font-bold text-xl">⚡</span>
            </div>
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
