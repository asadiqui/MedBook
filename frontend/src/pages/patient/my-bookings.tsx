import Link from "next/link";
import { useBookings } from "../../hooks/useBookings";
import PatientLayout from "../../components/layout/PatientLayout";
import { formatTime12h } from "../../utils/time";

function initials(firstName?: string, lastName?: string): string {
	const a = (firstName || "").trim().slice(0, 1).toUpperCase();
	const b = (lastName || "").trim().slice(0, 1).toUpperCase();
	return (a + b) || "DR";
}

function cityFromAddress(addr?: string | null): string | null {
	const raw = String(addr || "").trim();
	if (!raw) return null;
	const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
	if (parts.length >= 2) return parts[parts.length - 1];
	return null;
}

function statusBadgeClass(status: string) {
	switch (status) {
		case "ACCEPTED":
			return "bg-green-200 text-green-900 border-green-300";
		case "PENDING":
			return "bg-yellow-200 text-yellow-900 border-yellow-300";
		case "REJECTED":
			return "bg-red-200 text-red-900 border-red-300";
		case "CANCELLED":
			return "bg-gray-200 text-gray-800 border-gray-300";
		default:
			return "bg-gray-200 text-gray-800 border-gray-300";
	}
}

export default function PatientMyBookingsPage() {
	const {
		bookings,
		loading,
		error,
		refetch,
		cancellingId,
		cancelError,
		cancelBooking,
	} = useBookings();

	return (
		<PatientLayout title="My Appointments" subtitle="Track your bookings">
			<div className="space-y-6">
				<div className="flex items-center justify-end">
					<Link href="/patient/find-doctor" className="text-sm font-semibold text-blue-600 hover:underline">
						Book new appointment
					</Link>
				</div>

			{loading && (
				<div className="rounded-xl border bg-white p-6 shadow-sm">
					<p className="text-sm text-gray-600">Loading bookings...</p>
					<div className="mt-3 space-y-2">
						<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
						<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
						<div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
					</div>
				</div>
			)}

			{!loading && error && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
					<p className="text-sm font-medium text-red-700">{error}</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-3 inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
					>
						Retry
					</button>
				</div>
			)}

			{!loading && !error && (
				<div className="rounded-xl border bg-white p-6 shadow-sm">
					{cancelError && (
						<div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
							<p className="text-sm font-medium text-red-700">{cancelError}</p>
						</div>
					)}

					{bookings.length === 0 ? (
						<p className="text-sm text-gray-600">No bookings yet.</p>
					) : (
						<div className="space-y-3">
							{bookings.map((b) => {
								const doctorName = b.doctor
									? `Dr. ${b.doctor.firstName} ${b.doctor.lastName}`
									: `Doctor ${b.doctorId}`;
								const specialty = (b.doctor?.specialty || "").trim();
								const address = b.doctor?.clinicAddress || null;
								const city = cityFromAddress(address);
								const avatar = b.doctor?.avatar || null;
								const canCancel = b.status === "PENDING" || b.status === "ACCEPTED";
								const isCancelling = cancellingId === b.id;

								return (
									<div key={b.id} className="rounded-xl border bg-white p-4 shadow-sm">
										<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
											<div className="flex min-w-0 items-start gap-4">
												<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
													{avatar ? (
														// eslint-disable-next-line @next/next/no-img-element
														<img src={avatar} alt="" className="h-full w-full object-cover" />
													) : (
														initials(b.doctor?.firstName, b.doctor?.lastName)
													)}
												</div>

												<div className="min-w-0">
													<div className="truncate text-base font-semibold text-gray-900">
														{doctorName}
													</div>
													{specialty ? (
														<div className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
															{specialty}
														</div>
													) : null}

													<div className="mt-2 space-y-1 text-xs text-gray-600">
														<div className="flex items-center gap-2">
															<svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" aria-hidden="true">
																<path
																	d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12Zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
																fill="currentColor"
																/>
															</svg>
															<span className="truncate">
																{address || "Location not provided"}
															</span>
														</div>
														{city ? (
															<div className="text-xs text-gray-500">{city}</div>
														) : null}
													</div>
												</div>
											</div>

											<div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
												<div className="flex items-center gap-2">
													<span className="text-sm font-semibold text-gray-900">
														{b.date}
													</span>
													<span className="text-sm text-gray-500">•</span>
													<span className="text-sm font-medium text-gray-700">
														{formatTime12h(b.startTime)}–{formatTime12h(b.endTime)}
													</span>
												</div>

												<div className="flex items-center gap-2">
													<span
														className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
															b.status,
														)}`}
													>
														{b.status}
													</span>

													<button
														type="button"
														disabled={!canCancel || isCancelling}
														onClick={async () => {
															const ok = window.confirm(
																"Are you sure you want to cancel this booking?",
															);
															if (!ok) return;

															try {
																await cancelBooking(b.id);
																await refetch();
															} catch {
																// cancelError is exposed by the hook
															}
														}}
														className={`rounded-xl border px-3 py-2 text-xs font-semibold transition
															${
																!canCancel
																	? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
																	: isCancelling
																		? "cursor-not-allowed border-red-200 bg-red-100 text-red-700"
																		: "border-red-200 bg-white text-red-700 hover:bg-red-50"
																}`}
													>
														{isCancelling ? "Cancelling..." : "Cancel"}
													</button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}
			</div>
		</PatientLayout>
	);
}
