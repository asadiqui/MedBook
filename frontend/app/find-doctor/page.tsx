"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useDoctorDirectory } from "@/lib/hooks/useDoctorDirectory";
import { useAuth } from "@/lib/hooks/useAuth";
import { resolveAvatarUrl } from "@/lib/utils/avatar";
import { getInitialsFromName } from "@/lib/utils/formatting";

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function LocationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function FindDoctorPage() {
  const router = useRouter();
  const { requireAuth, isBootstrapping, user } = useAuth();
  const { doctors, loading, error } = useDoctorDirectory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("anytime");

  useEffect(() => {
    if (isBootstrapping) return;
    requireAuth(["PATIENT"]);
  }, [isBootstrapping, requireAuth]);

  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>();
    doctors.forEach((doc) => {
      if (doc.specialty) uniqueSpecialties.add(doc.specialty);
    });
    return Array.from(uniqueSpecialties).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty?.toLowerCase().includes(query) ||
          doctor.bio?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (selectedSpecialty !== "all" && doctor.specialty !== selectedSpecialty) {
        return false;
      }

      return true;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const handleBookAppointment = (doctorId: string) => {
    router.push(`/book-appointment/${doctorId}`);
  };

  if (isBootstrapping || !user) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title="Find Doctor">
      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Specialist</h1>
          <p className="mt-2 text-base text-gray-600">
            Browse our directory of experienced doctors. Click "Book Appointment" to view their
            availability and schedule your visit.
          </p>
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Search Doctor or Condition
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <SearchIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Dr. Smith, Cardiology, Flu…"
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Availability</label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="anytime">Anytime</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this-week">This Week</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-600">Loading doctors...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-6 ring-1 ring-red-100">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && filteredDoctors.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-600">No doctors found. Try adjusting your filters.</p>
          </div>
        )}

        {!loading && !error && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="flex flex-col">
                <div className="flex flex-1 flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
                  <div className="mb-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-white shadow-sm">
                      {doctor.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveAvatarUrl(doctor.avatar)}
                          alt={doctor.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-blue-700">
                          {getInitialsFromName(doctor.name, "DR")}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                  <p className="mt-1 text-base font-medium text-blue-600">
                    {doctor.specialty || "General Practice"}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {doctor.bio || "Experienced medical professional providing quality healthcare."}
                  </p>

                  <div className="my-4 h-px bg-gray-100" />

                  {doctor.location && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                      <LocationIcon className="h-5 w-5 text-gray-500" />
                      <span className="truncate">{doctor.location}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleBookAppointment(doctor.id)}
                    className="mt-auto w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    View Availability & Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
