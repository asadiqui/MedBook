import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser, type CurrentUser } from "../../api/auth.api";
import { Booking, getDoctorSchedule } from "../../api/booking.api";
import DoctorLayout from "../../components/layout/DoctorLayout";
import { getAccessToken } from "../../utils/authStorage";
import { formatTime12h } from "../../utils/time";

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

function formatIsoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function initials(firstName?: string, lastName?: string): string {
	const a = (firstName || "").trim().slice(0, 1).toUpperCase();
	const b = (lastName || "").trim().slice(0, 1).toUpperCase();
	return (a + b) || "?";
}

function monthLabel(date: Date): string {
	return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
}

function daysInMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function firstDayOffset(date: Date): number {
	// 0=Sunday..6=Saturday
	return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
	const common = `h-5 w-5 ${className}`;
	switch (name) {
		case "dashboard":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "calendar":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v14A2.5 2.5 0 0 1 19.5 23h-15A2.5 2.5 0 0 1 2 20.5v-14A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm13 8H4v10.5c0 .276.224.5.5.5h15a.5.5 0 0 0 .5-.5V10ZM19.5 6h-15a.5.5 0 0 0-.5.5V8h16V6.5a.5.5 0 0 0-.5-.5Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "appointments":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.5A2.5 2.5 0 0 1 22 6.5v14A2.5 2.5 0 0 1 19.5 23h-15A2.5 2.5 0 0 1 2 20.5v-14A2.5 2.5 0 0 1 4.5 4H6V3a1 1 0 0 1 1-1Zm13 8H4v10.5c0 .276.224.5.5.5h15a.5.5 0 0 0 .5-.5V10Z"
						fill="currentColor"
					/>
					<path
						d="M12 12a1 1 0 0 1 1 1v2.586l1.293 1.293a1 1 0 1 1-1.414 1.414l-1.586-1.586A1 1 0 0 1 11 16v-3a1 1 0 0 1 1-1Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "patients":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "messages":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v10h1.5H6v1.385L7.846 16H20V6H4Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "lab":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M9 2a1 1 0 0 0 0 2h1v6.586L4.293 16.293a1 1 0 0 0-.293.707V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a1 1 0 0 0-.293-.707L14 10.586V4h1a1 1 0 1 0 0-2H9Zm3 10.414L17.586 18H6.414L12 12.414ZM6 20v-0.001L6.001 20H18v-0.001L18.001 20H6Z"
						fill="currentColor"
					/>
				</svg>
			);
		case "settings":
			return (
				<svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
					<path
						d="M19.14 12.936c.04-.303.06-.616.06-.936s-.02-.633-.06-.936l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.55 7.55 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.41l-.36 2.54c-.58.23-1.13.54-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.72 7.5a.5.5 0 0 0 .12.64l2.03 1.58c-.04.303-.06.616-.06.936s.02.633.06.936l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.49.4 1.04.71 1.62.94l.36 2.54c.06.24.26.41.49.41h3.8c.24 0 .45-.17.49-.41l.36-2.54c.58-.23 1.13-.54 1.62-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
						fill="currentColor"
					/>
				</svg>
			);
		default:
			return null;
	}
}

function BellIcon({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 ${className}`} aria-hidden="true">
			<path
				d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Zm-2 1H7v-6a5 5 0 1 1 10 0v6Z"
				fill="currentColor"
			/>
		</svg>
	);
}

function HelpIcon({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 ${className}`} aria-hidden="true">
			<path
				d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 .001-16.001A8 8 0 0 1 12 20Zm0-5a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 12 15Zm0-10a4 4 0 0 0-4 4 1 1 0 1 0 2 0 2 2 0 1 1 2.6 1.92c-1.38.46-2.6 1.35-2.6 3.08a1 1 0 1 0 2 0c0-.62.3-.93 1.22-1.24A3.98 3.98 0 0 0 16 9a4 4 0 0 0-4-4Z"
				fill="currentColor"
			/>
		</svg>
	);
}

function ConfirmedBadge() {
	return (
		<span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
			Confirmed
		</span>
	);
}

function PendingBadge() {
	return (
		<span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
			Pending
		</span>
	);
}

function CancelledBadge() {
	return (
		<span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
			Cancelled
		</span>
	);
}

export default function DoctorDashboardPage() {
	const today = useMemo(() => new Date(), []);
	const todayIso = useMemo(() => formatIsoDate(today), [today]);

	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [doctorId, setDoctorId] = useState<string | null>(null);
	const [me, setMe] = useState<CurrentUser | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => {
		const token = getAccessToken();
		setAccessToken(token);
		if (!token) {
			setRole(null);
			setMe(null);
			setDoctorId(null);
			setLoading(false);
			setBookings([]);
			setAuthReady(true);
			return;
		}

		const payload = parseJwtPayload(token);
		setRole(payload?.role || null);
		setDoctorId(payload?.sub || null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const run = async () => {
			if (!accessToken) return;
			try {
				const user = await getCurrentUser({ accessToken });
				setMe(user);
				if (user?.id) setDoctorId(user.id);
				if (user?.role) setRole(user.role);
			} catch (err: any) {
				setMe(null);
				setError(err?.message || "Failed to load profile");
			} finally {
				setAuthReady(true);
			}
		};
		run();
	}, [accessToken]);

	useEffect(() => {
		const run = async () => {
			if (!accessToken || !doctorId) {
				setLoading(false);
				setBookings([]);
				return;
			}

			if (role && role !== "DOCTOR") {
				setLoading(false);
				setBookings([]);
				setError("This page is for doctors only.");
				return;
			}
			try {
				setError(null);
				setLoading(true);
				const data = await getDoctorSchedule(doctorId, { date: todayIso }, { accessToken });
				setBookings(Array.isArray(data) ? data : []);
			} catch (err: any) {
				setError(err?.message || "Failed to load dashboard");
				setBookings([]);
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [accessToken, doctorId, role, todayIso]);

	const acceptedPatientCount = useMemo(() => {
		const ids = new Set(
			bookings
				.filter((b: Booking) => b.status === "ACCEPTED")
				.map((b: Booking) => b.patientId),
		);
		return ids.size;
	}, [bookings]);

	const pendingCount = useMemo(
		() => bookings.filter((b: Booking) => b.status === "PENDING").length,
		[bookings],
	);

	const rejectedCount = useMemo(
		() => bookings.filter((b: Booking) => b.status === "REJECTED").length,
		[bookings],
	);

	const todaysAppointments = useMemo(() => {
		return bookings
			.filter(
				(b: Booking) =>
					b.status === "ACCEPTED" || b.status === "PENDING" || b.status === "CANCELLED",
			)
			.slice()
			.sort((a: Booking, b: Booking) => a.startTime.localeCompare(b.startTime));
	}, [bookings]);

	const displayName = useMemo(() => {
		const first = (me?.firstName || "").trim();
		const last = (me?.lastName || "").trim();
		const full = `${first} ${last}`.trim();
		return full || "Doctor";
	}, [me?.firstName, me?.lastName]);

	const displaySpecialty = useMemo(() => {
		return (me?.specialty || "").trim() || "";
	}, [me?.specialty]);

	const calendarDays = useMemo(() => {
		const total = daysInMonth(today);
		const offset = firstDayOffset(today);
		const days = Array.from({ length: total }, (_, i) => i + 1);
		return { total, offset, days };
	}, [today]);

	return (
		<DoctorLayout title="Dashboard" subtitle="Overview of your day">
			<div className="grid gap-6 lg:grid-cols-[1fr_340px]">
				{/* Left Column */}
				<div className="space-y-6">
					{/* Greeting */}
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h1 className="text-2xl font-semibold">
								Good Morning, {displayName === "Doctor" ? displayName : `Dr. ${displayName}`}
							</h1>
							<p className="mt-1 text-sm text-gray-600">Here’s your schedule overview for today.</p>
							{authReady && !accessToken && (
								<p className="mt-1 text-sm text-red-600">Please log in to see your dashboard.</p>
							)}
						</div>
						<div className="flex items-center gap-3">
							<button
								type="button"
								className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
							>
								View Calendar
							</button>
						</div>
					</div>

					{/* Stats */}
					<div className="grid gap-4 md:grid-cols-3">
						<div className="rounded-xl border bg-white p-6 shadow-sm">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-xs font-medium text-gray-500">Accepted Patients Today</p>
									<p className="mt-2 text-2xl font-semibold">{acceptedPatientCount}</p>
									<p className="mt-2 text-xs font-medium text-gray-500">Appointments confirmed</p>
								</div>
								<div className="rounded-lg bg-green-50 p-2 text-green-700">
									<Icon name="patients" className="text-green-700" />
								</div>
							</div>
						</div>

						<div className="rounded-xl border bg-white p-6 shadow-sm">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-xs font-medium text-gray-500">Pending Requests</p>
									<p className="mt-2 text-2xl font-semibold">{pendingCount}</p>
									<p className="mt-2 text-xs font-medium text-gray-500">Waiting for approval</p>
								</div>
								<div className="rounded-lg bg-yellow-50 p-2 text-yellow-800">
									<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
										<path
											d="M12 8v5l3 2"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
										/>
										<path
											d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
											stroke="currentColor"
											strokeWidth="2"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div className="rounded-xl border bg-white p-6 shadow-sm">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-xs font-medium text-gray-500">Rejected Today</p>
									<p className="mt-2 text-2xl font-semibold">{rejectedCount}</p>
									<p className="mt-2 text-xs font-medium text-gray-500">Declined appointments</p>
								</div>
								<div className="rounded-lg bg-red-50 p-2 text-red-700">
									<svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
										<path d="M8 8l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
										<path d="M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
										<path
											d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
											stroke="currentColor"
											strokeWidth="2"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>

					{/* Today's Appointments */}
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h3 className="text-sm font-semibold text-gray-900">Today’s Appointments</h3>
						<div className="mt-4 space-y-2">
							{loading && <p className="text-sm text-gray-500">Loading…</p>}
							{!loading && error && <p className="text-sm text-red-600">{error}</p>}
							{!loading && !error && todaysAppointments.length === 0 && (
								<p className="text-sm text-gray-500">No appointments today.</p>
							)}

							{!loading &&
								!error &&
								todaysAppointments.map((b) => {
									const patientName = b.patient
										? `${b.patient.firstName} ${b.patient.lastName}`
										: `Patient ${b.patientId}`;
									const typeLabel = `${b.duration} min appointment`;
									return (
										<Link
											href={`/doctor/appointments/${b.id}`}
											key={b.id}
											className="flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/30"
										>
											<div className="flex items-center gap-4">
												<div className="w-20 text-xs font-semibold text-gray-600">
													{formatTime12h(b.startTime)}
												</div>
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xs font-bold text-blue-700">
														{initials(b.patient?.firstName, b.patient?.lastName)}
													</div>
													<div>
														<div className="text-sm font-semibold">{patientName}</div>
														<div className="text-xs text-gray-500">{typeLabel}</div>
													</div>
												</div>
											</div>

											{b.status === "ACCEPTED" ? (
												<ConfirmedBadge />
											) : b.status === "PENDING" ? (
												<PendingBadge />
											) : (
												<CancelledBadge />
											)}
										</Link>
									);
							})}
						</div>
					</div>
				</div>

				{/* Right Sidebar */}
				<aside className="space-y-6">
					{/* Calendar */}
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<div className="text-sm font-semibold text-gray-900">{monthLabel(today)}</div>

						<div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-gray-500">
							{["S", "M", "T", "W", "T", "F", "S"].map((d) => (
								<div key={d} className="font-semibold">
									{d}
								</div>
							))}
						</div>

						<div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
							{Array.from({ length: calendarDays.offset }).map((_, idx) => (
								<div key={`spacer-${idx}`} className="h-9 w-9" />
							))}
							{calendarDays.days.map((day) => {
								const isToday = day === today.getDate();
								return (
									<div
										key={day}
										className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
											isToday
												? "bg-blue-600 text-white"
												: "text-gray-700 hover:bg-gray-50"
										}`}
									>
										{day}
									</div>
								);
							})}
						</div>
					</div>
				</aside>
			</div>
		</DoctorLayout>
	);
}
