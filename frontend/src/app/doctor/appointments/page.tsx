'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
  };
}

export default function DoctorAppointmentsPage() {
  const { user, hasHydrated, isLoading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAuthReady = hasHydrated && !authLoading;

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/booking/doctor');
      setBookings(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user || user.role !== 'DOCTOR') return;
    fetchBookings();
  }, [fetchBookings, isAuthReady, user]);

  const handleAccept = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      await api.patch(`/booking/${bookingId}/accept`);
      await fetchBookings(); // Refresh the list
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to accept booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      await api.patch(`/booking/${bookingId}/reject`);
      await fetchBookings(); // Refresh the list
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      await api.patch(`/booking/${bookingId}/cancel`);
      await fetchBookings(); // Refresh the list
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'DOCTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only doctors can view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Appointments</h1>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-100 text-red-800">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No appointments yet</h2>
            <p className="text-gray-600">You don't have any appointment requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {booking.patient.firstName} {booking.patient.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {booking.startTime} - {booking.endTime} ({booking.duration} minutes)</p>
                      <p><strong>Phone:</strong> {booking.patient.phone || 'Not provided'}</p>
                      <p><strong>Email:</strong> {booking.patient.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                      <Link
                        href={`/chat?bookingId=${booking.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                      >
                        Chat
                      </Link>
                    )}
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAccept(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                        >
                          {actionLoading === booking.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                        >
                          {actionLoading === booking.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {actionLoading === booking.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}