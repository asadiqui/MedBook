"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import AvailabilityForm from "@/components/availability/AvailabilityForm";
import { createAvailability, getMyAvailability } from "@/lib/api/availability";
import { getDoctorBookings, Booking } from "@/lib/api/booking";
import { useAuth } from "@/lib/hooks/useAuth";

export default function DoctorAvailabilityPage() {
  const { user, isBootstrapping, requireAuth } = useAuth();
  const [availability, setAvailability] = useState<Array<{ date: string; startTime: string; endTime: string }>>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    } catch (err: any) {
      setFormError(err.message || "Failed to create availability");
    } finally {
      setSaving(false);
    }
  };

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const hourlySchedule = useMemo(() => {
    type HourSlot = {
      hour: number;
      startTime: string;
      endTime: string;
      status: "unavailable" | "available" | "pending" | "accepted";
      booking?: Booking;
    };

    const slots: HourSlot[] = [];
    const dateAvailability = availability.filter((a) => a.date === selectedDate);
    const dateBookings = bookings.filter(
      (b) => b.date === selectedDate && b.status !== "CANCELLED" && b.status !== "REJECTED"
    );

    for (let hour = 8; hour <= 19; hour++) {
      const startTime = minutesToTime(hour * 60);
      const endTime = minutesToTime((hour + 1) * 60);
      const startMinutes = hour * 60;
      const endMinutes = (hour + 1) * 60;

      const isAvailable = dateAvailability.some((avail) => {
        const availStart = timeToMinutes(avail.startTime);
        const availEnd = timeToMinutes(avail.endTime);
        return startMinutes >= availStart && endMinutes <= availEnd;
      });

      if (!isAvailable) {
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
        });
      } else {
        slots.push({ hour, startTime, endTime, status: "available" });
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (isBootstrapping || !user) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title="Availability">
      <div className="space-y-4">
        {loading && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Loading availability…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <AvailabilityForm onSubmit={handleCreateAvailability} loading={saving} error={formError} />
        )}

        {!loading && !error && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Overview</h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {availableDates.length === 0 && (
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  No availability in the next 30 days.
                </div>
              )}
              {availableDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={
                    "rounded-lg border px-3 py-2 text-sm font-semibold " +
                    (selectedDate === date
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50")
                  }
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {hourlySchedule.map((slot) => (
                <div
                  key={slot.hour}
                  className={
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm " +
                    (slot.status === "unavailable"
                      ? "border-gray-200 bg-gray-50 text-gray-400"
                      : slot.status === "pending"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                        : slot.status === "accepted"
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-blue-200 bg-blue-50 text-blue-700")
                  }
                >
                  <span>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                  <span className="text-xs font-semibold">
                    {slot.status === "unavailable"
                      ? "Unavailable"
                      : slot.status === "pending"
                        ? "Pending"
                        : slot.status === "accepted"
                          ? "Accepted"
                          : "Available"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
