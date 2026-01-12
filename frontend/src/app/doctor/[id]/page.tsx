'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR';
  avatar: string | null;
  phone?: string;
  specialty?: string;
  bio?: string;
  consultationFee?: number;
  affiliation?: string;
  yearsOfExperience?: number;
  clinicAddress?: string;
  clinicContactPerson?: string;
  clinicPhone?: string;
  licenseDocument?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  doctorId: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = params.id as string;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      const [doctorResponse, availabilityResponse] = await Promise.all([
        api.get(`/users/doctor/${doctorId}`),
        api.get('/availability', { params: { doctorId } })
      ]);
      setDoctor(doctorResponse.data);
      setAvailability(availabilityResponse.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Doctor Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Doctor Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            {doctor.avatar ? (
              <img
                src={`${API_BASE_URL}${doctor.avatar}`}
                alt="Doctor avatar"
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-4xl font-bold">
                  {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dr. {doctor.firstName} {doctor.lastName}
              </h1>

              {doctor.specialty && (
                <p className="text-xl text-blue-600 font-medium mb-2">{doctor.specialty}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {doctor.consultationFee && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    ${doctor.consultationFee} per consultation
                  </span>
                )}
                {doctor.yearsOfExperience && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {doctor.yearsOfExperience} years experience
                  </span>
                )}
                {doctor.isVerified && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    ✓ Verified Doctor
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Information</h2>
            <div className="space-y-3">
              {doctor.affiliation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Affiliation</label>
                  <p className="text-gray-900">{doctor.affiliation}</p>
                </div>
              )}

              {doctor.specialty && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialty</label>
                  <p className="text-gray-900">{doctor.specialty}</p>
                </div>
              )}

              {doctor.yearsOfExperience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <p className="text-gray-900">{doctor.yearsOfExperience} years</p>
                </div>
              )}

              {doctor.consultationFee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Consultation Fee</label>
                  <p className="text-gray-900">${doctor.consultationFee}</p>
                </div>
              )}
            </div>
          </div>

          {/* Clinic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Clinic Information</h2>
            <div className="space-y-3">
              {doctor.clinicAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clinic Address</label>
                  <p className="text-gray-900">{doctor.clinicAddress}</p>
                </div>
              )}

              {doctor.clinicContactPerson && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="text-gray-900">{doctor.clinicContactPerson}</p>
                </div>
              )}

              {doctor.clinicPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clinic Phone</label>
                  <p className="text-gray-900">{doctor.clinicPhone}</p>
                </div>
              )}

              {doctor.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Personal Phone</label>
                  <p className="text-gray-900">{doctor.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {doctor.bio && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* License Document */}
        {doctor.licenseDocument && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">License Document</h2>
            <a
              href={`${API_BASE_URL}/uploads/documents/${doctor.licenseDocument}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View License Document
            </a>
          </div>
        )}

        {/* Availability Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Availability Schedule</h2>
          {availability.length > 0 ? (
            <div className="space-y-4">
              {availability
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = `/booking?doctorId=${doctorId}&date=${slot.date}&startTime=${slot.startTime}&endTime=${slot.endTime}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-600">No availability scheduled at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}