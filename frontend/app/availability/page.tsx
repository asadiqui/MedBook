"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import AvailabilityForm from "@/components/availability/AvailabilityForm";
import { createAvailability, deleteAvailability, getMyAvailability } from "@/lib/api/availability";
import { getDoctorBookings, Booking } from "@/lib/api/booking";
import { useAuth } from "@/lib/hooks/useAuth";
import { timeToMinutes, minutesToTime, formatTime, formatDate } from "@/lib/utils/dateTime";

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4m0 4h.01" />
    </svg>
  );
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6m0-6 6 6" />
    </svg>
  );
}

export default function DoctorAvailabilityPage() {
  const { user, isBootstrapping, requireAuth } = useAuth();
  const [availability, setAvailability] = useState<Array<{ id: string; date: string; startTime: string; endTime: string }>>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (isBootstrapping) return;
    requireAuth(["DOCTOR"]);
  }, [isBootstrapping, requireAuth]);

  const fetchAvailability = async () => {
    try {
      setError(null);
      const data = await getMyAvailability();
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load availability");
      setAvailability([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await getDoctorBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "DOCTOR") {
      setLoading(false);
      return;
    }

    Promise.all([fetchAvailability(), fetchBookings()]).finally(() => setLoading(false));

  }, [user]);

  useEffect(() => {
    if (availability.length > 0 && !selectedDate) {
      const dates = availability.map((a) => a.date).sort();
      const uniqueDates = Array.from(new Set(dates));
      if (uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0]);
      }
    }
  }, [availability, selectedDate]);

  const handleCreateAvailability = async (values: {
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      setSaving(true);
      setFormError(null);
      await createAvailability({
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
      });

      await Promise.all([fetchAvailability(), fetchBookings()]);
      setShowForm(false); // Close form on success
      

      if (!selectedDate) {
        setSelectedDate(values.date);
      }
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message || 
        "Failed to create availability. Please try again.";
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const hourlySchedule = useMemo(() => {
    type HourSlot = {
      hour: number;
      startTime: string;
      endTime: string;
      status: "unavailable" | "available" | "pending" | "accepted";
      booking?: Booking;
      availabilityId?: string;
    };

    const slots: HourSlot[] = [];
    const dateAvailability = availability.filter((a) => a.date === selectedDate);
    const dateBookings = bookings.filter(
      (b) => b.date === selectedDate && b.status !== "CANCELLED" && b.status !== "REJECTED"
    );

    for (let hour = 8; hour <= 20; hour++) {
      const startTime = minutesToTime(hour * 60);
      const endTime = minutesToTime((hour + 1) * 60);
      const startMinutes = hour * 60;
      const endMinutes = (hour + 1) * 60;

      const matchingAvail = dateAvailability.find((avail) => {
        const availStart = timeToMinutes(avail.startTime);
        const availEnd = timeToMinutes(avail.endTime);
        return startMinutes >= availStart && endMinutes <= availEnd;
      });

      if (!matchingAvail) {
        slots.push({ hour, startTime, endTime, status: "unavailable" });
        continue;
      }

      const booking = dateBookings.find((b) => {
        const bookStart = timeToMinutes(b.startTime);
        const bookEnd = timeToMinutes(b.endTime);
        return startMinutes >= bookStart && endMinutes <= bookEnd;
      });

      if (booking) {
        slots.push({
          hour,
          startTime,
          endTime,
          status: booking.status === "ACCEPTED" ? "accepted" : "pending",
          booking,
          availabilityId: matchingAvail.id,
        });
      } else {
        slots.push({ hour, startTime, endTime, status: "available", availabilityId: matchingAvail.id });
      }
    }

    return slots;
  }, [selectedDate, availability, bookings]);

  const availableDates = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    const dateSet = new Set(availability.map((a) => a.date));

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      if (dateSet.has(dateStr)) {
        dates.push(dateStr);
      }
    }
    return dates;
  }, [availability]);

  const handleQuickAddSlot = async (slotStartTime: string, slotEndTime: string) => {
    const confirmed = window.confirm(
      `Add availability for ${formatTime(slotStartTime)} - ${formatTime(slotEndTime)}?`
    );
    if (!confirmed) return;

    try {
      setDeleting(slotStartTime); // Reuse deleting state for loading
      await createAvailability({
        date: selectedDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
      });
      await fetchAvailability();
      await fetchBookings();
      

      if (!selectedDate) {
        setSelectedDate(selectedDate);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to add availability");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSlot = async (slotStartTime: string, slotEndTime: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${formatTime(slotStartTime)} - ${formatTime(slotEndTime)} time slot?`
    );
    if (!confirmed) return;

    try {
      setDeleting(slotStartTime);
      

      const containingAvailability = availability.find((avail) => {
        if (avail.date !== selectedDate) return false;
        const availStart = timeToMinutes(avail.startTime);
        const availEnd = timeToMinutes(avail.endTime);
        const slotStart = timeToMinutes(slotStartTime);
        const slotEnd = timeToMinutes(slotEndTime);
        return slotStart >= availStart && slotEnd <= availEnd;
      });

      if (!containingAvailability) {
        throw new Error("Could not find availability record for this slot");
      }

      const availStart = timeToMinutes(containingAvailability.startTime);
      const availEnd = timeToMinutes(containingAvailability.endTime);
      const slotStart = timeToMinutes(slotStartTime);
      const slotEnd = timeToMinutes(slotEndTime);

      await deleteAvailability(containingAvailability.id);

      const needsBefore = slotStart > availStart;
      const needsAfter = slotEnd < availEnd;

      if (needsBefore) {

        await createAvailability({
          date: selectedDate,
          startTime: containingAvailability.startTime,
          endTime: slotStartTime,
        });
      }

      if (needsAfter) {

        await createAvailability({
          date: selectedDate,
          startTime: slotEndTime,
          endTime: containingAvailability.endTime,
        });
      }

      await fetchAvailability();
      await fetchBookings();
      

      setTimeout(() => {
        const hasRemainingSlots = availability.some((a) => a.date === selectedDate);
        if (!hasRemainingSlots) {
          const allDates = availability.map((a) => a.date);
          const uniqueDates = Array.from(new Set(allDates));
          if (uniqueDates.length > 0) {
            setSelectedDate(uniqueDates[0]);
          } else {
            setSelectedDate(new Date().toISOString().split("T")[0]);
          }
        }
      }, 100);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete time slot");
    } finally {
      setDeleting(null);
    }
  };

  if (isBootstrapping || !user) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title="Availability Management">
      <div className="bg-gradient-to-b from-blue-50/30 to-white p-6">
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">Loading availability...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Add Availability</h3>
                      <p className="text-sm text-gray-500">
                        {availableDates.length === 0 
                          ? "Create your first availability slot" 
                          : "Add time slots for any date"}
                      </p>
                  </div>
                </div>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${showForm ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              
              {showForm && (
                <div className="border-t bg-gray-50 p-6">
                  <AvailabilityForm 
                    onSubmit={handleCreateAvailability} 
                    loading={saving} 
                    error={formError}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              )}
            </div>

            {}
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <ClockIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Schedule Overview</h3>
                    <p className="text-sm text-gray-600">View your daily schedule and bookings</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-gray-700">Select Date</label>
                  {availableDates.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-600 mb-1">No availability set</p>
                      <p className="text-xs text-gray-500">Add your available time slots to get started</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableDates.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className={
                            "group relative overflow-hidden rounded-xl border-2 px-4 py-3 text-left transition-all " +
                            (selectedDate === date
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm")
                          }
                        >
                          <div className="text-xs font-semibold uppercase tracking-wide"
                            style={{ color: selectedDate === date ? '#2563eb' : '#6b7280' }}
                          >
                            {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                          <div className="mt-1 text-lg font-bold"
                            style={{ color: selectedDate === date ? '#1e40af' : '#111827' }}
                          >
                            {new Date(date + "T00:00:00").toLocaleDateString("en-US", { day: "numeric" })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {}
                {availableDates.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-4 rounded-lg bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                      <span className="text-xs font-medium text-gray-600">Not Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-medium text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs font-medium text-gray-600">Pending Booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-xs font-medium text-gray-600">Accepted Booking</span>
                    </div>
                  </div>
                )}

                {}
                {availableDates.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {hourlySchedule.map((slot) => (
                      <div
                        key={slot.hour}
                        className={
                          "group relative overflow-hidden rounded-xl border-2 p-3 transition-all " +
                          (slot.status === "unavailable"
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                            : slot.status === "pending"
                              ? "border-yellow-300 bg-yellow-50 shadow-sm hover:shadow-md"
                              : slot.status === "accepted"
                                ? "border-green-300 bg-green-50 shadow-sm hover:shadow-md"
                                : "border-blue-300 bg-blue-50 shadow-sm hover:shadow-md hover:border-blue-400")
                        }
                      >
                        <div className="mb-2">
                          <div className="text-xs font-bold mb-1"
                            style={{
                              color: slot.status === "unavailable" 
                                ? '#9ca3af' 
                                : slot.status === "pending"
                                  ? '#d97706'
                                  : slot.status === "accepted"
                                    ? '#059669'
                                    : '#2563eb'
                            }}
                          >
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                          <div className="flex items-center justify-start">
                            {slot.status === "unavailable" ? (
                              <XCircleIcon className="h-4 w-4 text-gray-400" />
                            ) : slot.status === "pending" ? (
                              <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                            ) : slot.status === "accepted" ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs font-medium"
                          style={{
                            color: slot.status === "unavailable" 
                              ? '#9ca3af' 
                              : slot.status === "pending"
                                ? '#92400e'
                                : slot.status === "accepted"
                                  ? '#065f46'
                                  : '#1e40af'
                          }}
                        >
                          {slot.status === "unavailable"
                            ? "Not Available"
                            : slot.status === "pending"
                              ? "Pending"
                              : slot.status === "accepted"
                                ? "Booked"
                                : "Available"}
                        </div>
                        {slot.booking && (
                          <div className="mt-2 text-xs text-gray-600 truncate">
                            {slot.booking.patient?.firstName} {slot.booking.patient?.lastName}
                          </div>
                        )}
                        {slot.status === "unavailable" && (
                          <button
                            type="button"
                            onClick={() => handleQuickAddSlot(slot.startTime, slot.endTime)}
                            disabled={deleting === slot.startTime}
                            className="mt-2 w-full rounded-lg bg-green-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {deleting === slot.startTime ? "Adding..." : "Add"}
                          </button>
                        )}
                        {slot.status === "available" && slot.availabilityId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot.startTime, slot.endTime)}
                            disabled={deleting === slot.startTime}
                            className="mt-2 w-full rounded-lg bg-red-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {deleting === slot.startTime ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
