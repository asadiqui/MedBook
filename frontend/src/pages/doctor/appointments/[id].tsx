import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import DoctorLayout from "../../../components/layout/DoctorLayout";
import { getAccessToken } from "../../../utils/authStorage";
import { formatTime12h } from "../../../utils/time";
import {
	acceptBooking,
	getDoctorBookings,
	rejectBooking,
	type Booking,
} from "../../../api/booking.api";

function parseIsoDate(dateIso: string): Date | null {
	const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(String(dateIso));
	if (!m) return null;
	const year = Number(m[1]);
	const month = Number(m[2]);
	const day = Number(m[3]);
	if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
	return new Date(year, month - 1, day);
}

function formatDate(dateIso: string): string {
	const d = parseIsoDate(dateIso);
	if (!d) return dateIso;
	return new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(d);
}

function statusBadgeClass(status: string): string {
	const s = String(status || "").toUpperCase();
	if (s === "PENDING") return "bg-yellow-100 text-yellow-800";
	if (s === "ACCEPTED" || s === "APPROVED") return "bg-green-100 text-green-700";
	if (s === "COMPLETED") return "bg-blue-100 text-blue-700";
	if (s === "CANCELLED" || s === "REJECTED") return "bg-red-100 text-red-700";
	return "bg-gray-100 text-gray-700";
}

function statusLabel(status: string): string {
	const s = String(status || "").toUpperCase();
	if (s === "ACCEPTED") return "APPROVED";
	return s;
}

export default function DoctorAppointmentDetailsPage() {
	const router = useRouter();
	const id = useMemo(() => {
		const raw = router.query.id;
		return Array.isArray(raw) ? raw[0] : raw;
	}, [router.query.id]);

	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [item, setItem] = useState<Booking | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [acting, setActing] = useState<"approve" | "reject" | null>(null);

	useEffect(() => {
		setAccessToken(getAccessToken());
	}, []);

	const load = useCallback(async () => {
		if (!accessToken) {
			setItem(null);
			setLoading(false);
			setError("Login required");
			return;
		}
		if (!id) return;
		try {
			setError(null);
			setLoading(true);
			const list = await getDoctorBookings({ accessToken });
			const found = (Array.isArray(list) ? list : []).find((b) => b.id === id) || null;
			setItem(found);
			if (!found) setError("Appointment not found");
		} catch (err: any) {
			setError(err?.message || "Failed to load appointment");
			setItem(null);
		} finally {
			setLoading(false);
		}
	}, [accessToken, id]);

	useEffect(() => {
		load();
	}, [load]);

	const onApprove = async () => {
		if (!accessToken || !item) return;
		try {
			setActing("approve");
			setError(null);
			const updated = await acceptBooking(item.id, { accessToken });
			setItem(updated);
		} catch (err: any) {
			setError(err?.message || "Failed to approve appointment");
		} finally {
			setActing(null);
		}
	};

	const onReject = async () => {
		if (!accessToken || !item) return;
		try {
			setActing("reject");
			setError(null);
			const updated = await rejectBooking(item.id, { accessToken });
			setItem(updated);
		} catch (err: any) {
			setError(err?.message || "Failed to reject appointment");
		} finally {
			setActing(null);
		}
	};

	const headerRight = (
		<Link
			href="/doctor/appointments"
			className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
		>
			Back
		</Link>
	);

	return (
		<DoctorLayout title="Appointment Details" subtitle="Review appointment information" headerRight={headerRight}>
			{loading && (
				<div className="rounded-xl border bg-white p-4 shadow-sm">
					<p className="text-sm text-gray-600">Loading appointment…</p>
				</div>
			)}

			{!loading && error && (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
					<p className="text-sm font-medium text-red-700">{error}</p>
				</div>
			)}

			{!loading && !error && item && (
				<div className="space-y-4">
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="min-w-0">
								<h2 className="text-base font-semibold text-gray-900">
									{item.patient
										? `${item.patient.firstName} ${item.patient.lastName}`
										: `Patient ${item.patientId}`}
								</h2>
								<p className="mt-1 text-sm text-gray-600">ID: {item.patient?.id || item.patientId}</p>
							</div>
							<span
								className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
									item.status,
								)}`}
							>
								{statusLabel(item.status)}
							</span>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-xl border bg-white p-4 shadow-sm">
							<div className="text-xs font-semibold text-gray-700">Date</div>
							<div className="mt-1 text-sm text-gray-900">{formatDate(item.date)}</div>
						</div>
						<div className="rounded-xl border bg-white p-4 shadow-sm">
							<div className="text-xs font-semibold text-gray-700">Time</div>
							<div className="mt-1 text-sm text-gray-900">
								{formatTime12h(item.startTime)} → {formatTime12h(item.endTime)}
							</div>
						</div>
					</div>

					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<div className="text-xs font-semibold text-gray-700">Reason</div>
						<div className="mt-1 text-sm text-gray-900">{(item.reason || "").trim() || "—"}</div>
					</div>

					{String(item.status).toUpperCase() === "PENDING" && (
						<div className="rounded-xl border bg-white p-4 shadow-sm">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<p className="text-sm text-gray-600">This appointment is pending approval.</p>
								<div className="flex items-center gap-2">
									<button
										type="button"
										disabled={acting !== null}
										onClick={onApprove}
										className={
											acting !== null
												? "rounded-md bg-green-200 px-3 py-2 text-sm font-semibold text-white"
												: "rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
										}
									>
										{acting === "approve" ? "Approving…" : "Approve"}
									</button>
									<button
										type="button"
										disabled={acting !== null}
										onClick={onReject}
										className={
											acting !== null
												? "rounded-md bg-red-200 px-3 py-2 text-sm font-semibold text-white"
												: "rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
										}
									>
										{acting === "reject" ? "Rejecting…" : "Reject"}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</DoctorLayout>
	);
}
