import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BookingList from "../../components/booking/BookingList";
import { Booking, getDoctorSchedule } from "../../api/booking.api";
import { getAccessToken } from "../../utils/authStorage";

type JwtPayload = {
	sub?: string;
	email?: string;
	role?: string;
	iat?: number;
	exp?: number;
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

function todayIsoDate(): string {
	return new Date().toISOString().slice(0, 10);
}

export default function DoctorSchedulePage() {
	const [date, setDate] = useState<string>(todayIsoDate());
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [doctorId, setDoctorId] = useState<string | null>(null);

	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const acceptedBookings = useMemo(
		() => bookings.filter((b) => b.status === "ACCEPTED"),
		[bookings],
	);

	useEffect(() => {
		const token = getAccessToken();
		setAccessToken(token);

		if (!token) {
			setDoctorId(null);
			setError("Login required");
			setLoading(false);
			return;
		}

		const payload = parseJwtPayload(token);
		if (!payload?.sub) {
			setDoctorId(null);
			setError("Invalid token (missing user id)");
			setLoading(false);
			return;
		}

		if (payload.role && payload.role !== "DOCTOR") {
			setDoctorId(payload.sub);
			setError("This page is only for doctors");
			setLoading(false);
			return;
		}

		setDoctorId(payload.sub);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchSchedule = async (token: string, id: string, day: string) => {
		try {
			setError(null);
			setLoading(true);
			const data = await getDoctorSchedule(id, { date: day }, { accessToken: token });
			setBookings(data);
		} catch (err: any) {
			setError(err?.message || "Failed to load schedule");
			setBookings([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!accessToken || !doctorId) return;
		fetchSchedule(accessToken, doctorId, date);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessToken, doctorId, date]);

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-semibold">Doctor Schedule</h1>
				<div className="flex items-center gap-3">
					<Link
						href="/doctor/bookings"
						className="text-sm font-medium text-blue-600 hover:underline"
					>
						Doctor bookings
					</Link>
					<Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
						Back home
					</Link>
				</div>
			</div>

			<div className="rounded-lg border bg-white p-4 flex flex-wrap items-end justify-between gap-4">
				<label className="text-sm font-medium text-gray-700">
					Day
					<input
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="mt-2 block rounded-md border px-3 py-2 text-sm"
					/>
				</label>

				<button
					type="button"
					disabled={!accessToken || !doctorId || loading}
					onClick={() => {
						if (!accessToken || !doctorId) return;
						fetchSchedule(accessToken, doctorId, date);
					}}
					className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white transition
						${
							!accessToken || !doctorId || loading
								? "cursor-not-allowed bg-blue-300"
								: "bg-blue-600 hover:bg-blue-700"
						}`}
				>
					{loading ? "Loading..." : "Refresh"}
				</button>
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<p className="text-sm font-medium text-red-700">{error}</p>
				</div>
			)}

			{!error && (
				<div className="rounded-lg border bg-white p-4 space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<p className="text-sm text-gray-700">
							Accepted bookings: <span className="font-semibold">{acceptedBookings.length}</span>
						</p>
						<p className="text-xs text-gray-500">
							Only ACCEPTED bookings are shown in the schedule.
						</p>
					</div>

					{loading ? (
						<div className="space-y-2">
							<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
							<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
							<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
						</div>
					) : (
						<BookingList bookings={acceptedBookings} emptyText="No accepted bookings for this day." />
					)}
				</div>
			)}
		</div>
	);
}
