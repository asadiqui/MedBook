"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDoctorProfile } from "@/lib/api/doctorDirectory";
import { getAvailabilityCalendar } from "@/lib/api/availability";
import { createBooking, getPatientBookings, getPublicBookedSlots, Booking, PublicBookedSlot } from "@/lib/api/booking";
import { resolveAvatarUrl } from "@/lib/utils/avatar";
import { getInitialsFromName } from "@/lib/utils/formatting";

type AvailabilitySlot = {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
};

type DoctorInfo = {
  id: string;
  name: string;
  specialty: string | null;
  avatar: string | null;
  bio: string | null;
};

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
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

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

type ToastState = { open: false } | { open: true; type: "success" | "error"; message: string };

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

function Toast({ state, onClose }: { state: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (!state.open) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [state, onClose]);

  if (!state.open) return null;

  return (
    <div className="fixed right-6 top-6 z-50 animate-in slide-in-from-top-2 duration-200">
      <div
        className={
          "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium shadow-xl ring-1 min-w-[320px] " +
          (state.type === "success"
            ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
            : "bg-red-50 text-red-900 ring-red-200")
        }
      >
        {state.type === "success" ? (
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-emerald-600" />
        ) : (
          <AlertCircleIcon className="h-5 w-5 flex-shrink-0 text-red-600" />
        )}
        <span className="flex-1">{state.message}</span>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = Array.isArray(params?.doctorId)
    ? params?.doctorId[0]
    : (params?.doctorId as string | undefined);

  const { requireAuth, isBootstrapping, user } = useAuth();

  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [bookedSlots, setBookedSlots] = useState<PublicBookedSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number; startTime: string; endTime: string; date: string } | null>(null);
  const [duration, setDuration] = useState<60 | 120>(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false });

  useEffect(() => {
    if (isBootstrapping) return;
    requireAuth(["PATIENT"]);
  }, [isBootstrapping, requireAuth]);

  const fetchAvailability = useCallback(async () => {
    if (!doctorId) return;

    setLoading(true);
    try {
      const doctorData = await getDoctorProfile(doctorId);
      setDoctor({
        id: doctorData.id,
        name: `Dr. ${doctorData.firstName} ${doctorData.lastName}`.trim(),
        specialty: doctorData.specialty || null,
        avatar: doctorData.avatar || null,
        bio: doctorData.bio || null,
      });

      const today = new Date();
      const from = today.toISOString().split("T")[0];
      const toDate = new Date(today);
      toDate.setDate(toDate.getDate() + 30);
      const to = toDate.toISOString().split("T")[0];

      const calendar = await getAvailabilityCalendar({ doctorId, from, to });
      const slots: AvailabilitySlot[] = Object.entries(calendar).flatMap(([date, entries]) =>
        entries.map((entry) => ({
          id: entry.id,
          doctorId,
          date,
          startTime: entry.startTime,
          endTime: entry.endTime,
        }))
      );

      setAvailabilitySlots(slots);

      // Fetch all booked slots (public endpoint)
      try {
        const bookedSlotsData = await getPublicBookedSlots(doctorId);
        setBookedSlots(bookedSlotsData || []);
      } catch {
        setBookedSlots([]);
      }

      if (user) {
        try {
          const bookings = await getPatientBookings();
          setMyBookings(bookings);
        } catch {
          setMyBookings([]);
        }
      }
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        "Failed to load availability. Please try again.";
      
      setToast({
        open: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [doctorId, user]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const availableDates = useMemo(() => {
    const dateSet = new Set(availabilitySlots.map((a) => a.date));
    const today = new Date();
    const dates: string[] = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      if (dateSet.has(dateStr)) {
        dates.push(dateStr);
      }
    }
    return dates;
  }, [availabilitySlots]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const hourlySchedule = useMemo(() => {
    if (!selectedDate) return [];

    type HourSlot = {
      hour: number;
      startTime: string;
      endTime: string;
      status: "unavailable" | "available" | "reserved" | "my-pending" | "my-accepted";
      booking?: Booking;
    };

    const slots: HourSlot[] = [];
    const dateAvailability = availabilitySlots.filter((a) => a.date === selectedDate);
    const dateBookings = myBookings.filter(
      (b) => b.date === selectedDate && b.doctorId === doctorId && b.status !== "CANCELLED" && b.status !== "REJECTED"
    );
    const dateBookedSlots = bookedSlots.filter(
      (b) => b.date === selectedDate
    );

    const slotDuration = duration === 120 ? 2 : 1; // 2 hours for 120min, 1 hour for 60min
    
    for (let hour = 8; hour < 20; hour += slotDuration) {
      const startTime = minutesToTime(hour * 60);
      const endTime = minutesToTime((hour + slotDuration) * 60);
      const startMinutes = hour * 60;
      const endMinutes = (hour + slotDuration) * 60;

      const isAvailable = dateAvailability.some((avail) => {
        const availStart = timeToMinutes(avail.startTime);
        const availEnd = timeToMinutes(avail.endTime);
        return startMinutes >= availStart && endMinutes <= availEnd;
      });

      const myBooking = dateBookings.find((b) => {
        const bookStart = timeToMinutes(b.startTime);
        const bookEnd = timeToMinutes(b.endTime);
        return startMinutes >= bookStart && endMinutes <= bookEnd;
      });

      // Check if this slot is booked by someone else
      const myBookingIds = new Set(dateBookings.map(b => b.id));
      const otherBooking = dateBookedSlots.find((b) => {
        const bookStart = timeToMinutes(b.startTime);
        const bookEnd = timeToMinutes(b.endTime);
        // Slot overlaps with a booked time and it's not my booking
        return !myBookingIds.has(b.id) && startMinutes >= bookStart && endMinutes <= bookEnd;
      });

      if (!isAvailable) {
        slots.push({ hour, startTime, endTime, status: "unavailable" });
      } else if (myBooking) {
        slots.push({
          hour,
          startTime,
          endTime,
          status: myBooking.status === "ACCEPTED" ? "my-accepted" : "my-pending",
          booking: myBooking,
        });
      } else if (otherBooking) {
        slots.push({
          hour,
          startTime,
          endTime,
          status: "reserved",
        });
      } else {
        slots.push({ hour, startTime, endTime, status: "available" });
      }
    }

    return slots;
  }, [selectedDate, availabilitySlots, myBookings, bookedSlots, doctorId, duration, user]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleSlotClick = (slot: { hour: number; startTime: string; endTime: string; status: string }) => {
    if (slot.status === "available" && selectedDate) {
      setSelectedSlot({
        hour: slot.hour,
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: selectedDate,
      });
    }
  };

  const handleBook = async () => {
    if (!doctorId || !selectedDate || !selectedSlot) {
      setToast({ open: true, type: "error", message: "Please select a time slot first." });
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        doctorId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        duration,
      });

      setToast({ open: true, type: "success", message: "Booking request sent successfully!" });
      const bookings = await getPatientBookings();
      setMyBookings(bookings);
      const bookedSlotsData = await getPublicBookedSlots(doctorId);
      setBookedSlots(bookedSlotsData || []);
      setSelectedSlot(null);
    } catch (error: any) {
      // Extract the error message from the API response
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        "Unable to create booking. Please try again.";
      
      setToast({ open: true, type: "error", message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (isBootstrapping || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Book Appointment">
      <Toast state={toast} onClose={() => setToast({ open: false })} />

      <div className="bg-gradient-to-b from-blue-50/30 to-white p-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Doctors
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">Loading availability...</p>
            </div>
          </div>
        ) : !doctor ? (
          <div className="flex items-center justify-center py-20">
            <div className="rounded-xl bg-red-50 p-6 ring-1 ring-red-100">
              <p className="text-sm font-medium text-red-700">Doctor not found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-white shadow-sm">
                  {doctor.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveAvatarUrl(doctor.avatar)} alt={doctor.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-700">
                      {getInitialsFromName(doctor.name, "DR")}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                  <p className="mt-1 text-lg font-medium text-blue-600">
                    {doctor.specialty || "General Practice"}
                  </p>
                  {doctor.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{doctor.bio}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">Select a Date</h2>
                  {availableDates.length === 0 ? (
                    <p className="text-sm text-gray-600">No available dates found.</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {availableDates.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                          }}
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
                  )}
                </div>

                {selectedDate && (
                  <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="mb-3 text-lg font-bold text-gray-900">Select Duration</h2>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDuration(60);
                          setSelectedSlot(null);
                        }}
                        className={
                          "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition " +
                          (duration === 60
                            ? "border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-200"
                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50")
                        }
                      >
                        60 Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDuration(120);
                          setSelectedSlot(null);
                        }}
                        className={
                          "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition " +
                          (duration === 120
                            ? "border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-200"
                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50")
                        }
                      >
                        120 Minutes
                      </button>
                    </div>
                  </div>
                )}

                {selectedDate && (
                  <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">
                      Available Times - {formatDate(selectedDate)}
                    </h2>

                    <div className={`grid gap-2 ${duration === 120 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'}`}>
                      {hourlySchedule.map((slot) => {
                        const colors = {
                          unavailable: {
                            border: "border-gray-200",
                            bg: "bg-gray-50",
                            text: "text-gray-400",
                            icon: "text-gray-300",
                            label: "Not Available",
                          },
                          available: {
                            border: "border-blue-300",
                            bg: "bg-blue-100",
                            text: "text-blue-900",
                            icon: "text-blue-600",
                            label: "Available",
                          },
                          reserved: {
                            border: "border-red-300",
                            bg: "bg-red-100",
                            text: "text-red-900",
                            icon: "text-red-600",
                            label: "Reserved",
                          },
                          "my-pending": {
                            border: "border-amber-200",
                            bg: "bg-amber-50",
                            text: "text-amber-900",
                            icon: "text-amber-600",
                            label: "Pending",
                          },
                          "my-accepted": {
                            border: "border-green-200",
                            bg: "bg-green-50",
                            text: "text-green-900",
                            icon: "text-green-600",
                            label: "Accepted",
                          },
                        } as const;

                        const style = colors[slot.status];
                        const isSelected = selectedSlot?.hour === slot.hour;
                        const isClickable = slot.status === "available";

                        return (
                          <button
                            key={slot.hour}
                            type="button"
                            onClick={() => handleSlotClick(slot)}
                            disabled={!isClickable}
                            className={`rounded-lg border p-3 transition ${style.border} ${style.bg} ${
                              isSelected ? "ring-2 ring-blue-500 scale-105" : ""
                            } ${isClickable ? "cursor-pointer hover:scale-105 hover:shadow-md" : "cursor-not-allowed opacity-70"}`}
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
                              <span className={`text-[9px] font-semibold ${style.text}`}>{style.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-gray-300" />
                        <span className="text-gray-600">Not Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-gray-600">Reserved</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-gray-600">Your Pending</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-gray-600">Your Accepted</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="sticky top-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">Booking Summary</h2>

                  {selectedSlot ? (
                    <>
                      <div className="mb-4 space-y-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 ring-1 ring-blue-100">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Date</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {new Date(selectedSlot.date + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Time</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Duration</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{duration} minutes</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleBook}
                        disabled={submitting}
                        className={
                          "w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
                          (submitting
                            ? "cursor-not-allowed bg-blue-300"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700")
                        }
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Booking...
                          </span>
                        ) : (
                          "Confirm Booking"
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="rounded-xl bg-gray-50 p-8 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <ClockIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Select a Date & Time</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Choose an available slot from the calendar to continue
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
