"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useClearedAppointments } from "@/lib/hooks/useClearedAppointments";
import { formatTime12h } from "@/lib/utils/time";
import { getInitials } from "@/lib/utils/formatting";
import {
  Booking,
  getDoctorSchedule,
  getPatientBookings,
} from "@/lib/api/booking";

function bySoonest(a: Booking, b: Booking) {
  const keyA = `${a.date}T${a.startTime}`;
  const keyB = `${b.date}T${b.startTime}`;
  return keyA.localeCompare(keyB);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function statusBadgeClass(status: string): string {
  const s = String(status || "").toUpperCase();
  if (s === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (s === "ACCEPTED") return "bg-green-100 text-green-700";
  if (s === "CANCELLED" || s === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

function canClearAppointment(status: string): boolean {
  return status === "REJECTED" || status === "CANCELLED";
}

export default function DashboardPage() {
  const { user, isBootstrapping, requireAuth } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const isDoctor = user?.role === "DOCTOR";
  const { clearAppointment, filterCleared } = useClearedAppointments();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (isBootstrapping) return;
    requireAuth(["PATIENT", "DOCTOR"]);

    const run = async () => {
      if (!user) return;
      try {
        setError(null);
        setLoading(true);

        if (isPatient) {
          const data = await getPatientBookings();
          setBookings(Array.isArray(data) ? data : []);
        } else if (isDoctor) {
          const todayIso = formatIsoDate(new Date());
          const data = await getDoctorSchedule(user.id, todayIso);
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        console.error('Dashboard: Failed to load bookings:', err);
        setError(err?.message || "Failed to load dashboard");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isBootstrapping, user]);

  const filteredBookings = useMemo(() => filterCleared(bookings), [bookings, filterCleared]);

  const upcomingPatient = useMemo(() => {
    return filteredBookings
      .filter((b) => b.status === "PENDING" || b.status === "ACCEPTED")
      .slice()
      .sort(bySoonest);
  }, [filteredBookings]);

  const nextBooking = upcomingPatient[0];

  const acceptedPatientCount = useMemo(() => {
    const ids = new Set(filteredBookings.filter((b) => b.status === "ACCEPTED").map((b) => b.patientId));
    return ids.size;
  }, [filteredBookings]);

  const pendingCount = useMemo(
    () => filteredBookings.filter((b) => b.status === "PENDING").length,
    [filteredBookings]
  );

  const cancelledCount = useMemo(
    () => bookings.filter((b) => b.status === "CANCELLED").length,
    [bookings]
  );

  const totalAppointmentsToday = useMemo(
    () => bookings.filter((b) => b.status !== "CANCELLED").length,
    [bookings]
  );

  const upcomingDoctor = useMemo(() => {
    return filteredBookings
      .slice()
      .sort(bySoonest)
      .filter((b) => b.status === "ACCEPTED" || b.status === "PENDING");
  }, [filteredBookings]);

  if (isBootstrapping || !user) {
    return <LoadingSpinner />;
  }

  if (user.role === "ADMIN") {
    return null;
  }

  if (isPatient) {

    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Welcome back!</h2>
                <p className="mt-2 text-sm text-blue-50">
                  {loading
                    ? "Loading your appointments…"
                    : `You have ${upcomingPatient.length} upcoming appointment${upcomingPatient.length === 1 ? "" : "s"}.`}
                </p>
                {error && <p className="mt-2 text-sm text-red-100">{error}</p>}
              </div>

              <Link
                href="/find-doctor"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M12 7v10M7 12h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Book New Appointment
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Link
              href="/find-doctor"
              className="group rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                        <path
                          d="M10 4a6 6 0 1 0 3.75 10.68l4.79 4.79a1 1 0 0 0 1.42-1.42l-4.79-4.79A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 transition-colors">
                        Find a Doctor
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Search for specialists and book appointments
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors">
                    <span>Start searching</span>
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Next Appointment</h3>
                <Link href="/appointments" className="text-sm font-semibold text-blue-600 hover:underline">
                  See all
                </Link>
              </div>

              {loading && <p className="mt-4 text-sm text-gray-600">Loading…</p>}
              {!loading && error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
              {!loading && !error && !nextBooking && (
                <p className="mt-4 text-sm text-gray-600">No upcoming appointments.</p>
              )}

              {!loading && !error && nextBooking && (
                <div className="mt-4 rounded-xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {nextBooking.doctor
                          ? `Dr. ${nextBooking.doctor.firstName} ${nextBooking.doctor.lastName}`
                          : `Doctor ${nextBooking.doctorId}`}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        <span className="font-medium">{nextBooking.date}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span>
                          {formatTime12h(nextBooking.startTime)}–{formatTime12h(nextBooking.endTime)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/appointments"
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Welcome back, Dr. {user.firstName}!</h2>
              <p className="mt-2 text-sm text-blue-50">
                {loading ? "Loading your schedule…" : `You have ${upcomingDoctor.length} upcoming bookings.`}
              </p>
              {error && <p className="mt-2 text-sm text-red-100">{error}</p>}
            </div>

            <Link
              href="/availability"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
            >
              Update Availability
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-600">Accepted Patients Today</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{acceptedPatientCount}</div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-600">Pending Requests</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{pendingCount}</div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-600">Total Appointments Today</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{totalAppointmentsToday}</div>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-600">Cancelled</div>
            <div className="mt-2 text-2xl font-bold text-red-600">{cancelledCount}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Today’s Schedule</h3>
            <Link href="/appointments" className="text-sm font-semibold text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          {loading && <p className="mt-4 text-sm text-gray-600">Loading…</p>}
          {!loading && error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          {!loading && !error && filteredBookings.length === 0 && (
            <p className="mt-4 text-sm text-gray-600">No appointments today.</p>
          )}

          {!loading && !error && filteredBookings.length > 0 && (
            <div className="mt-4 space-y-3">
              {filteredBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-semibold text-blue-700">
                      {getInitials(b.patient?.firstName, b.patient?.lastName)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {b.patient
                          ? `${b.patient.firstName} ${b.patient.lastName}`
                          : `Patient ${b.patientId}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime12h(b.startTime)} – {formatTime12h(b.endTime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(b.status)}`}>
                      {b.status}
                    </span>
                    {canClearAppointment(b.status) && (
                      <button
                        type="button"
                        onClick={() => clearAppointment(b.id)}
                        className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
