import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DoctorLayout from "../../components/layout/DoctorLayout";
import { getDoctorBookings, type Booking } from "../../api/booking.api";
import { getAccessToken } from "../../utils/authStorage";
import { formatTime12h } from "../../utils/time";

export default function DoctorPatientsPage() {
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [items, setItems] = useState<Booking[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setAccessToken(getAccessToken());
	}, []);

	const refetch = async () => {
		if (!accessToken) {
			setItems([]);
			setLoading(false);
			return;
		}
		try {
			setError(null);
			setLoading(true);
			const data = await getDoctorBookings({ accessToken }, { status: "PENDING" });
			setItems(Array.isArray(data) ? data : []);
		} catch (err: any) {
			setError(err?.message || "Failed to load booking requests");
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessToken]);

	const cards = useMemo(() => items, [items]);

	return (
		<DoctorLayout title="Patients" subtitle="Pending approvals">
			<div className="space-y-4">
				<div className="rounded-xl border bg-white p-4 shadow-sm">
					<h2 className="text-sm font-semibold text-gray-900">Incoming Appointment Requests</h2>
					<p className="mt-1 text-sm text-gray-600">Click a request to view details.</p>
				</div>

				{loading && (
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<p className="text-sm text-gray-600">Loading requests…</p>
					</div>
				)}

				{!loading && error && (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
						<p className="text-sm font-medium text-red-700">{error}</p>
					</div>
				)}

				{!loading && !error && cards.length === 0 && (
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<p className="text-sm text-gray-600">No pending requests.</p>
					</div>
				)}

				{!loading &&
					!error &&
					cards.map((b: Booking) => {
						const patientName = b.patient
							? `${b.patient.firstName} ${b.patient.lastName}`
							: `Patient ${b.patientId}`;
						const dateTime = `${b.date} • ${formatTime12h(b.startTime)}`;
						const reason = (b.reason || "").trim() || "—";

						return (
							<Link
								key={b.id}
								href={`/doctor/appointments/${b.id}`}
								className="block rounded-xl border bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
							>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div className="min-w-0">
										<div className="text-sm font-semibold text-gray-900">{patientName}</div>
										<div className="mt-1 text-sm text-gray-600">{dateTime}</div>
										<div className="mt-3">
											<div className="text-xs font-semibold text-gray-700">Reason</div>
											<div className="mt-1 text-sm text-gray-700">{reason}</div>
										</div>
									</div>

									<div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
										View
										<svg
											viewBox="0 0 20 20"
											fill="currentColor"
											className="h-4 w-4"
											aria-hidden="true"
										>
											<path
												fillRule="evenodd"
												d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.06.02Z"
											clipRule="evenodd"
										/>
										</svg>
									</div>
								</div>
							</Link>
						);
					})}
			</div>
		</DoctorLayout>
	);
}
