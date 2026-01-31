import { useEffect, useMemo, useState } from "react";
import DoctorLayout from "../../components/layout/DoctorLayout";
import AvailabilityForm from "../../components/availability/AvailabilityForm";
import { createAvailability, getAvailability } from "../../api/availability.api";
import { AvailabilitySlot } from "../../types/availability";
import { getAccessToken } from "../../utils/authStorage";
import { getDoctorBookings, Booking } from "../../api/booking.api";

type JwtPayload = {
  sub?: string;
  role?: string;
};

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function DoctorAvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    const token = getAccessToken();
    setAccessToken(token);
    if (!token) {
      setDoctorId(null);
      return;
    }
    const payload = parseJwtPayload(token);
    setDoctorId(payload?.sub || null);
  }, []);

  const canLoad = useMemo(() => Boolean(accessToken && doctorId), [accessToken, doctorId]);

  const fetchAvailability = async (id: string) => {
    try {
      setError(null);
      const data = await getAvailability({ doctorId: id });
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load availability");
      setAvailability([]);
    }
  };

  const fetchBookings = async () => {
    if (!accessToken) return;
    try {
      const data = await getDoctorBookings({ accessToken });
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load bookings:", err);
      setBookings([]);
    }
  };

  useEffect(() => {
    if (!doctorId) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchAvailability(doctorId),
      fetchBookings()
    ]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);
    
  const handleCreateAvailability = async (values: {
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      setSaving(true);
      setFormError(null);
      if (!accessToken || !doctorId) {
        throw new Error("Login required");
      }

      await createAvailability(
        {
          doctorId,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
        },
        { accessToken },
      );

      await Promise.all([
        fetchAvailability(doctorId),
        fetchBookings()
      ]);
    } catch (err: any) {
      setFormError(err.message || "Failed to create availability");
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for time calculations
  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Generate hourly schedule for selected date
  const hourlySchedule = useMemo(() => {
    type HourSlot = {
      hour: number;
      startTime: string;
      endTime: string;
      status: 'unavailable' | 'available' | 'pending' | 'accepted';
      booking?: Booking;
    };

    const slots: HourSlot[] = [];
    const dateAvailability = availability.filter((a) => a.date === selectedDate);
    const dateBookings = bookings.filter(
      (b) => b.date === selectedDate && b.status !== 'CANCELLED' && b.status !== 'REJECTED'
    );

    // Generate all hours from 8 AM to 8 PM
    for (let hour = 8; hour <= 19; hour++) {
      const startTime = minutesToTime(hour * 60);
      const endTime = minutesToTime((hour + 1) * 60);
      const startMinutes = hour * 60;
      const endMinutes = (hour + 1) * 60;

      // Check if this hour is within any availability slot
      const isAvailable = dateAvailability.some((avail) => {
        const availStart = timeToMinutes(avail.startTime);
        const availEnd = timeToMinutes(avail.endTime);
        return startMinutes >= availStart && endMinutes <= availEnd;
      });

      if (!isAvailable) {
        slots.push({
          hour,
          startTime,
          endTime,
          status: 'unavailable',
        });
        continue;
      }

      // Check if this hour is booked
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
          status: booking.status === 'ACCEPTED' ? 'accepted' : 'pending',
          booking,
        });
      } else {
        slots.push({
          hour,
          startTime,
          endTime,
          status: 'available',
        });
      }
    }

    return slots;
  }, [selectedDate, availability, bookings]);

  // Get unique dates with availability (next 30 days)
  const availableDates = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    const dateSet = new Set(availability.map((a) => a.date));
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (dateSet.has(dateStr)) {
        dates.push(dateStr);
      }
    }
    return dates;
  }, [availability]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DoctorLayout title="Availability" subtitle="Create availability slots for patients to book">
      <div className="space-y-4">
        {loading && (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-600">Loading availability…</p>
          </div>
        )}

        {!loading && (!accessToken || !doctorId) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">Login required</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && canLoad && (
          <AvailabilityForm onSubmit={handleCreateAvailability} loading={saving} error={formError} />
        )}

        {!loading && !error && canLoad && (
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Schedule</h2>
              <p className="mt-1 text-sm text-gray-600">
                View your availability and bookings. Available slots are shown in green, booked slots in blue.
              </p>
            </div>

            {availability.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-600">No availability slots created yet.</p>
                <p className="mt-1 text-xs text-gray-500">Use the form above to add your availability.</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Date Tabs */}
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={
                        "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition " +
                        (selectedDate === date
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                      }
                    >
                      {formatDate(date)}
                    </button>
                  ))}
                </div>

                {/* Hourly Schedule Grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {hourlySchedule.map((slot) => {
                    const colors = {
                      unavailable: {
                        border: 'border-gray-200',
                        bg: 'bg-gray-50',
                        text: 'text-gray-400',
                        icon: 'text-gray-300',
                      },
                      available: {
                        border: 'border-emerald-200',
                        bg: 'bg-emerald-50',
                        text: 'text-emerald-900',
                        icon: 'text-emerald-600',
                      },
                      pending: {
                        border: 'border-amber-200',
                        bg: 'bg-amber-50',
                        text: 'text-amber-900',
                        icon: 'text-amber-600',
                      },
                      accepted: {
                        border: 'border-blue-200',
                        bg: 'bg-blue-50',
                        text: 'text-blue-900',
                        icon: 'text-blue-600',
                      },
                    };

                    const style = colors[slot.status];

                    return (
                      <div
                        key={slot.hour}
                        className={`rounded-lg border p-3 transition ${style.border} ${style.bg}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${style.icon}`}>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" opacity="0.2" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className={`text-xs font-bold ${style.text}`}>
                              {formatTime(slot.startTime)}
                            </p>
                            <p className={`text-[10px] ${style.text} opacity-75`}>
                              {formatTime(slot.endTime)}
                            </p>
                          </div>
                          {slot.status === 'unavailable' && (
                            <span className="text-[9px] font-medium text-gray-400">Not Available</span>
                          )}
                          {slot.status === 'available' && (
                            <span className="text-[9px] font-semibold text-emerald-600">Available</span>
                          )}
                          {slot.status === 'pending' && (
                            <div className="text-center">
                              <span className="block text-[9px] font-semibold text-amber-600">Pending</span>
                              {slot.booking && (
                                <p className="mt-0.5 text-[8px] text-amber-700">
                                  {slot.booking.patient?.firstName}
                                </p>
                              )}
                            </div>
                          )}
                          {slot.status === 'accepted' && (
                            <div className="text-center">
                              <span className="block text-[9px] font-semibold text-blue-600">Booked</span>
                              {slot.booking && (
                                <p className="mt-0.5 text-[8px] text-blue-700">
                                  {slot.booking.patient?.firstName}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                    <span className="text-gray-600">Not Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-gray-600">Pending Approval</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-gray-600">Accepted/Booked</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
