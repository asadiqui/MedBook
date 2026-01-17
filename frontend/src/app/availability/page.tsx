'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  doctorId: string;
}

export default function AvailabilityPage() {
  const { user, hasHydrated, isLoading: authLoading } = useAuthStore();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(''); // Add this state

  const isAuthReady = hasHydrated && !authLoading;

  const fetchAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/availability/me');
      setAvailabilities(response.data);
    } catch (error) {
      console.error('Failed to fetch availabilities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user || user.role !== 'DOCTOR') return;
    fetchAvailabilities();
  }, [fetchAvailabilities, isAuthReady, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setMessage('');

    try {
      await api.post('/availability', {
        ...formData,
      });
      setFormData({ date: '', startTime: '', endTime: '' });
      setMessage('Availability added successfully!');
      fetchAvailabilities();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create availability';
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/availability/${id}`);
      setMessage('Availability deleted successfully!');
      fetchAvailabilities();
    } catch (error: any) {
      console.error('Failed to delete availability:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete availability';
      setMessage(errorMessage);
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
          <p className="text-gray-600">Only doctors can manage availability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Manage Your Availability
        </h1>

        {/* Add Availability Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Availability</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Add error/success message display */}
            {message && (
              <div className={`p-4 rounded-md ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Availability'}
            </button>
          </form>
        </div>

        {/* Availabilities List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Availabilities</h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : availabilities.length === 0 ? (
            <p className="text-gray-600">No availabilities set yet.</p>
          ) : (
            <div className="space-y-4">
              {availabilities.map((availability) => (
                <div
                  key={availability.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {availability.date} - {availability.startTime} to {availability.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(availability.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}