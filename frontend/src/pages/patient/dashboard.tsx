import Link from "next/link";
import { useMemo } from "react";
import PatientLayout from "../../components/layout/PatientLayout";
import { useBookings } from "../../hooks/useBookings";
import type { Booking } from "../../api/booking.api";
import { formatTime12h } from "../../utils/time";

function bySoonest(a: Booking, b: Booking) {
	const keyA = `${a.date}T${a.startTime}`;
	const keyB = `${b.date}T${b.startTime}`;
	return keyA.localeCompare(keyB);
}

export default function PatientDashboardPage() {
	const { bookings, loading, error } = useBookings();

	const upcoming = useMemo(() => {
		return bookings
			.filter((b) => b.status === "PENDING" || b.status === "ACCEPTED")
			.slice()
			.sort(bySoonest);
	}, [bookings]);

	const nextBooking = upcoming[0];

	return (
		<PatientLayout title="Dashboard" subtitle="Overview of your health status">
			<div className="space-y-6">
				{/* Welcome banner */}
				<div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h2 className="text-2xl font-semibold">Welcome back!</h2>
							<p className="mt-2 text-sm text-blue-50">
								{loading
									? "Loading your appointments…"
									: `You have ${upcoming.length} upcoming appointment${upcoming.length === 1 ? "" : "s"}.`}
							</p>
							{!loading && error && (
								<p className="mt-2 text-sm text-red-100">{error}</p>
							)}
						</div>

						<Link
							href="/patient/find-doctor"
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

				{/* Main row: Find a Doctor + Next Appointment */}
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<div className="flex items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-2">
									<svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600" fill="none" aria-hidden="true">
										<path
											d="M10 4a6 6 0 1 0 3.75 10.68l4.79 4.79a1 1 0 0 0 1.42-1.42l-4.79-4.79A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
											fill="currentColor"
										/>
									</svg>
									<h3 className="text-lg font-semibold text-gray-900">Find a Doctor</h3>
								</div>
								<p className="mt-2 text-sm text-gray-600">
									Search for specialists, general practitioners, or clinics near you.
								</p>
							</div>
						</div>

						<div className="mt-4 flex flex-wrap items-center gap-3">
							<div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border bg-gray-50 px-3 py-2 text-sm text-gray-600">
								<svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" aria-hidden="true">
									<path
										d="M10 4a6 6 0 1 0 3.75 10.68l4.79 4.79a1 1 0 0 0 1.42-1.42l-4.79-4.79A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
										fill="currentColor"
									/>
								</svg>
								<input
									disabled
									placeholder="Specialty, Doctor Name..."
									className="w-full bg-transparent outline-none placeholder:text-gray-400"
									aria-label="Search doctors"
								/>
							</div>

							<Link
								href="/patient/find-doctor"
								className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
							>
								Search
							</Link>
						</div>
					</div>

					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<div className="flex items-center justify-between gap-4">
							<h3 className="text-lg font-semibold text-gray-900">Next Appointment</h3>
							<Link href="/patient/my-bookings" className="text-sm font-semibold text-blue-600 hover:underline">
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
										href="/patient/my-bookings"
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
		</PatientLayout>
	);
}
