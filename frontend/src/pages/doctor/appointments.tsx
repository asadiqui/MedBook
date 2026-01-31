import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DoctorLayout from "../../components/layout/DoctorLayout";
import { getAccessToken } from "../../utils/authStorage";
import { formatTime12h } from "../../utils/time";
import {
	acceptBooking,
	getDoctorBookings,
	rejectBooking,
	type Booking,
} from "../../api/booking.api";


function parseIsoDate(dateIso: string): Date | null {
	// Expects YYYY-MM-DD. Use a local Date to avoid timezone shifts.
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

function initials(firstName?: string, lastName?: string): string {
	const a = (firstName || "").trim().slice(0, 1).toUpperCase();
	const b = (lastName || "").trim().slice(0, 1).toUpperCase();
	return (a + b) || "?";
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

type UiTab = "ALL" | "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

export default function DoctorAppointmentsPage() {
	const router = useRouter();
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [items, setItems] = useState<Booking[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [tab, setTab] = useState<UiTab>("ALL");
	const [actingId, setActingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	useEffect(() => {
		setAccessToken(getAccessToken());
	}, []);

	const refetch = useCallback(async () => {
		if (!accessToken) {
			setItems([]);
			setLoading(false);
			return;
		}
		try {
			setError(null);
			setLoading(true);
			const data = await getDoctorBookings({ accessToken });
			setItems(Array.isArray(data) ? data : []);
		} catch (err: any) {
			setError(err?.message || "Failed to load appointments");
			setItems([]);
		} finally {
			setLoading(false);
		}
	}, [accessToken]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	const rowsAll = useMemo(() => {
		return items
			.slice()
			.sort((a: Booking, b: Booking) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
	}, [items]);

	const rows = useMemo(() => {
		const normalized = (s: string) => String(s || "").toUpperCase();
		const status = (b: Booking) => normalized(b.status);
		if (tab === "ALL") return rowsAll;
		if (tab === "PENDING") return rowsAll.filter((b: Booking) => status(b) === "PENDING");
		if (tab === "APPROVED")
			return rowsAll.filter((b: Booking) => status(b) === "ACCEPTED" || status(b) === "APPROVED");
		if (tab === "COMPLETED") return rowsAll.filter((b: Booking) => status(b) === "COMPLETED");
		// CANCELLED tab also includes REJECTED (backend uses REJECTED)
		return rowsAll.filter((b: Booking) => status(b) === "CANCELLED" || status(b) === "REJECTED");
	}, [rowsAll, tab]);

	const onApprove = async (id: string) => {
		if (!accessToken) return;
		try {
			setActionError(null);
			setActingId(id);
			const updated = await acceptBooking(id, { accessToken });
			setItems((prev: Booking[]) => prev.map((b: Booking) => (b.id === id ? updated : b)));
		} catch (err: any) {
			setActionError(err?.message || "Failed to approve appointment");
		} finally {
			setActingId(null);
		}
	};

	const onReject = async (id: string) => {
		if (!accessToken) return;
		try {
			setActionError(null);
			setActingId(id);
			const updated = await rejectBooking(id, { accessToken });
			setItems((prev: Booking[]) => prev.map((b: Booking) => (b.id === id ? updated : b)));
		} catch (err: any) {
			setActionError(err?.message || "Failed to reject appointment");
		} finally {
			setActingId(null);
		}
	};

	const headerRight = (
		<div className="flex items-center gap-3">
			<button
				type="button"
				className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
				onClick={() => {
					// UI only
				}}
			>
				<svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500" fill="none" aria-hidden="true">
					<path
						d="M12 3v10m0 0 4-4m-4 4-4-4"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M5 21h14"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					/>
				</svg>
				Export List
			</button>
			<Link
				href="/doctor/availability"
				className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
			>
				+ New Appointment
			</Link>
		</div>
	);

	return (
		<DoctorLayout
			title="Appointments"
			subtitle="Manage and track your patient schedule"
			headerRight={headerRight}
		>
			<div className="space-y-4">
				<div className="rounded-xl border bg-white p-2 shadow-sm">
					<div className="flex flex-wrap items-center gap-2 px-2 py-2">
						{([
							{ key: "ALL", label: "All" },
							{ key: "PENDING", label: "Pending" },
							{ key: "APPROVED", label: "Approved" },
							{ key: "COMPLETED", label: "Completed" },
							{ key: "CANCELLED", label: "Cancelled" },
						] as Array<{ key: UiTab; label: string }>).map((t) => {
							const isActive = tab === t.key;
							return (
								<button
									key={t.key}
									type="button"
									onClick={() => setTab(t.key)}
									className={
										isActive
											? "rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
											: "rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
									}
								>
									{t.label}
								</button>
							);
						})}
					</div>
				</div>

				{loading && (
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<p className="text-sm text-gray-600">Loading appointments…</p>
					</div>
				)}

				{!loading && error && (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
						<p className="text-sm font-medium text-red-700">{error}</p>
					</div>
				)}

				{!loading && !error && actionError && (
					<div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
						<p className="text-sm font-medium text-red-700">{actionError}</p>
					</div>
				)}

				{!loading && !error && rowsAll.length === 0 && (
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<p className="text-sm text-gray-600">No appointments found.</p>
					</div>
				)}

				{!loading && !error && rowsAll.length > 0 && rows.length === 0 && (
					<div className="rounded-xl border bg-white p-4 shadow-sm">
						<p className="text-sm text-gray-600">No appointments in this tab.</p>
					</div>
				)}

				{!loading && !error && rows.length > 0 && (
					<div className="overflow-hidden rounded-xl border bg-white shadow-sm">
						<div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
							<div className="col-span-4">Patient Details</div>
							<div className="col-span-3">Date &amp; Time</div>
							<div className="col-span-2">Reason</div>
							<div className="col-span-2">Status</div>
							<div className="col-span-1 text-right">Actions</div>
						</div>

						<div className="divide-y">
							{rows.map((b) => {
								const p = b.patient;
								const patientNameRaw = p
									? `${(p.firstName || "").trim()} ${(p.lastName || "").trim()}`.trim()
									: "";
								const patientName = patientNameRaw || p?.email || `Patient ${b.patientId}`;
								const patientId = p?.id || b.patientId;
								const dateLabel = formatDate(b.date);
								const timeRange = `${formatTime12h(b.startTime)} → ${formatTime12h(b.endTime)}`;
								const reason = (b.reason || "").trim() || "—";
								const badgeCls = statusBadgeClass(b.status);
								const badgeLabel = statusLabel(b.status);
								const isPending = String(b.status).toUpperCase() === "PENDING";
								const disabled = actingId === b.id;
								return (
									<div
										key={b.id}
										role="button"
										tabIndex={0}
										onClick={(e) => {
											const target = e.target as HTMLElement;
											if (target?.closest("button")) return;
											router.push(`/doctor/appointments/${b.id}`);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												router.push(`/doctor/appointments/${b.id}`);
										}
									}}
										className="grid cursor-pointer grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50"
									>
										<div className="col-span-4 flex items-center gap-3">
											{p?.avatar ? (
												<img
													src={p.avatar}
													alt=""
													className="h-9 w-9 rounded-full object-cover"
												/>
											) : (
												<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
													{initials(p?.firstName, p?.lastName)}
												</div>
											)}
											<div className="min-w-0">
												<div className="truncate text-sm font-semibold text-gray-900">{patientName}</div>
												<div className="mt-0.5 truncate text-xs text-gray-500">ID: {patientId}</div>
											</div>
										</div>

										<div className="col-span-3">
											<div className="text-sm font-semibold text-gray-900">{dateLabel}</div>
											<div className="mt-0.5 text-xs text-gray-500">{timeRange}</div>
										</div>

										<div className="col-span-2">
											<div className="text-sm text-gray-700">{reason}</div>
										</div>

										<div className="col-span-2">
											<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeCls}`}>
												{badgeLabel}
											</span>
										</div>

										<div className="col-span-1 flex items-center justify-end gap-2">
											{isPending ? (
												<>
													<button
														type="button"
														disabled={disabled}
														onClick={(e) => {
														e.stopPropagation();
														onApprove(b.id);
													}}
														className={
															disabled
																? "rounded-md bg-green-200 px-3 py-1.5 text-xs font-semibold text-white"
																: "rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700"
														}
													>
														Approve
													</button>
													<button
														type="button"
														disabled={disabled}
														onClick={(e) => {
														e.stopPropagation();
														onReject(b.id);
													}}
														className={
															disabled
																? "rounded-md bg-red-200 px-3 py-1.5 text-xs font-semibold text-white"
																: "rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
														}
													>
														Reject
													</button>
												</>
											) : (
												<button
													type="button"
													onClick={(e) => {
													e.stopPropagation();
													router.push(`/doctor/appointments/${b.id}`);
												}}
													className="rounded-md border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
												>
													View Details
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</DoctorLayout>
	);
}
