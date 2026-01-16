'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  bio?: string;
  consultationFee?: number;
  affiliation?: string;
  yearsOfExperience?: number;
  clinicAddress?: string;
  avatar?: string | null;
}

export default function BookingPage() {
  const { user, hasHydrated, isLoading: authLoading } = useAuthStore();
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    startTime: '',
    duration: 60,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const isAuthReady = hasHydrated && !authLoading;

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await api.get('/users/doctors');
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user || user.role !== 'PATIENT') return;
    fetchDoctors();
    
    // Pre-fill form from URL parameters
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const startTime = searchParams.get('startTime');
    
    if (doctorId) setFormData(prev => ({ ...prev, doctorId }));
    if (date) setFormData(prev => ({ ...prev, date }));
    if (startTime) setFormData(prev => ({ ...prev, startTime }));
  }, [fetchDoctors, isAuthReady, searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setMessage('');
    setCreatedBookingId(null);
    try {
      const response = await api.post('/booking', formData);
      setMessage(`Booking request submitted successfully! Status: ${response.data.status}`);
      setCreatedBookingId(response.data.id);
      setFormData({ doctorId: '', date: '', startTime: '', duration: 60 });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'PATIENT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only patients can book appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Book an Appointment
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName} {doctor.specialty ? `(${doctor.specialty})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={60}>60 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            {formData.doctorId && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Selected Doctor</h3>
                  <a
                    href={`/doctor/${formData.doctorId}`}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View full profile
                  </a>
                </div>
                {(() => {
                  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
                  return selectedDoctor ? (
                    <div className="flex items-start space-x-4">
                      {selectedDoctor.avatar ? (
                        <img
                          src={selectedDoctor.avatar.startsWith('http') ? selectedDoctor.avatar : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${selectedDoctor.avatar}`}
                          alt="Doctor avatar"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-xl font-bold">
                            {selectedDoctor.firstName?.[0]}{selectedDoctor.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                        </h4>
                        {selectedDoctor.specialty && (
                          <p className="text-gray-600">{selectedDoctor.specialty}</p>
                        )}
                        {selectedDoctor.consultationFee && (
                          <p className="text-gray-600">Consultation Fee: ${selectedDoctor.consultationFee}</p>
                        )}
                        {selectedDoctor.affiliation && (
                          <p className="text-gray-600">Affiliation: {selectedDoctor.affiliation}</p>
                        )}
                        {selectedDoctor.yearsOfExperience && (
                          <p className="text-gray-600">Experience: {selectedDoctor.yearsOfExperience} years</p>
                        )}
                        {selectedDoctor.bio && (
                          <p className="text-gray-600 mt-2">{selectedDoctor.bio}</p>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-md ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span>{message}</span>
                  {createdBookingId && (
                    <Link
                      href={`/chat?bookingId=${createdBookingId}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Open chat
                    </Link>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}