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

  // Group availability by date
  const availabilityByDate = useMemo(() => {
    const grouped: Record<string, AvailabilitySlot[]> = {};
    availability.forEach((slot) => {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push(slot);
    });
    // Sort slots by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [availability]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach((booking) => {
      if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') return;
      if (!grouped[booking.date]) grouped[booking.date] = [];
      grouped[booking.date].push(booking);
    });
    return grouped;
  }, [bookings]);

  // Get slots for selected date with booking info
  const slotsForSelectedDate = useMemo(() => {
    const slots = availabilityByDate[selectedDate] || [];
    const dateBookings = bookingsByDate[selectedDate] || [];
    
    return slots.map((slot) => {
      // Find if this slot has a booking
      const booking = dateBookings.find(
        (b) => b.startTime === slot.startTime && b.endTime === slot.endTime
      );
      return { ...slot, booking };
    });
  }, [selectedDate, availabilityByDate, bookingsByDate]);

  // Get unique dates with availability (next 30 days)
  const availableDates = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (availabilityByDate[dateStr]) {
        dates.push(dateStr);
      }
    }
    return dates;
  }, [availabilityByDate]);

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
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<h2 className="text-sm font-semibold text-gray-900">Your availability</h2>
						<p className="mt-1 text-sm text-gray-600">Slots you’ve published for patients.</p>

						{availability.length === 0 ? (
							<p className="mt-4 text-sm text-gray-600">No availability slots found.</p>
						) : (
							<div className="mt-4 space-y-3">
								{availability.map((slot) => (
									<div key={slot.id} className="rounded-lg border bg-white p-4">
										<p className="text-sm font-semibold text-gray-900">{slot.date}</p>
										<p className="mt-1 text-sm text-gray-600">
											{slot.startTime} — {slot.endTime}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</DoctorLayout>
	);
}