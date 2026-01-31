import Link from "next/link";
import { useEffect, useState } from "react";
import BookingList from "../../components/booking/BookingList";
import { getAccessToken } from "../../utils/authStorage";
import {
	Booking,
	acceptBooking,
	getDoctorBookings,
	rejectBooking,
} from "../../api/booking.api";

export default function DoctorBookingsPage() {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<
		{ id: string; action: "accept" | "reject" } | null
	>(null);

	const fetchBookings = async (token: string | null) => {
		try {
			setError(null);
			setLoading(true);
			if (!token) {
				setBookings([]);
				setError("Login required");
				return;
			}
			const data = await getDoctorBookings({ accessToken: token });
			setBookings(data);
		} catch (err: any) {
			setError(err?.message || "Failed to load doctor bookings");
		} finally {
			setLoading(false);
		}
	};

	const handleAccept = async (booking: Booking) => {
		if (!accessToken) {
			setError("Login required");
			return;
		}

		if (booking.status !== "PENDING") return;

		try {
			setActionLoading({ id: booking.id, action: "accept" });
			await acceptBooking(booking.id, { accessToken });
			await fetchBookings(accessToken);
		} catch (err: any) {
			setError(err?.message || "Failed to accept booking");
		} finally {
			setActionLoading(null);
		}
	};

	const handleReject = async (booking: Booking) => {
		if (!accessToken) {
			setError("Login required");
			return;
		}

		if (booking.status !== "PENDING") return;

		try {
			setActionLoading({ id: booking.id, action: "reject" });
			await rejectBooking(booking.id, { accessToken });
			await fetchBookings(accessToken);
		} catch (err: any) {
			setError(err?.message || "Failed to reject booking");
		} finally {
			setActionLoading(null);
		}
	};

	useEffect(() => {
		const token = getAccessToken();
		setAccessToken(token);
		fetchBookings(token);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Doctor Bookings</h1>
				<Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
					Back home
				</Link>
			</div>

			{loading && (
				<div className="rounded-lg border bg-white p-4">
					<p className="text-sm text-gray-600">Loading bookings...</p>
					<div className="mt-3 space-y-2">
						<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
						<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
						<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
					</div>
				</div>
			)}

			{!loading && error && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="text-sm font-medium text-red-700">{error}</p>
					<button
						type="button"
						onClick={() => fetchBookings(accessToken)}
						className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
					>
						Retry
					</button>
				</div>
			)}

			{!loading && !error && (
				<div className="rounded-lg border bg-white p-4">
					<BookingList
						bookings={bookings}
						emptyText="No bookings found."
						onAcceptBooking={handleAccept}
						onRejectBooking={handleReject}
						bookingActionLoading={actionLoading}
					/>
				</div>
			)}
		</div>
	);
}
