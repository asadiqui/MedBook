import React, { useEffect, useMemo, useState } from "react";
import type { DoctorDirectoryItem } from "../../api/doctorDirectory.api";
import { createBookingFromPanel } from "../../api/booking.api";

function toIsoDate(d: Date): string {
	return d.toISOString().slice(0, 10);
}

function timeToMinutes(t: string): number {
	const [hh, mm] = t.split(":").map(Number);
	return hh * 60 + mm;
}

function minutesToTime(m: number): string {
	const hh = Math.floor(m / 60);
	const mm = m % 60;
	return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function addMinutes(time: string, minutes: number): string {
	return minutesToTime(timeToMinutes(time) + minutes);
}

function buildTimeOptions(): string[] {
	const start = 8 * 60;
	const end = 20 * 60;
	const step = 30;
	const options: string[] = [];

	// Only include start times that keep endTime within 20:00.
	for (let t = start; t <= end - step; t += step) {
		options.push(minutesToTime(t));
	}
	return options;
}

function initials(name: string): string {
	const parts = String(name || "")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	const a = parts[0]?.[0] || "D";
	const b = parts[1]?.[0] || "R";
	return (a + b).toUpperCase();
}

export type BookingPanelProps = {
	open: boolean;
	doctors: DoctorDirectoryItem[];
	selectedDoctorId: string | null;
	onSelectDoctorId: (doctorId: string | null) => void;
	patientId: string | null;
	accessToken: string | null;
	onClose: () => void;
	onBooked: () => void;
	onToast: (message: string, type: "success" | "error") => void;
};

export default function BookingPanel({
	open,
	doctors,
	selectedDoctorId,
	onSelectDoctorId,
	patientId,
	accessToken,
	onClose,
	onBooked,
	onToast,
}: BookingPanelProps) {
	const timeOptions = useMemo(() => buildTimeOptions(), []);
	const selectedDoctor = selectedDoctorId
		? doctors.find((d) => d.id === selectedDoctorId) || null
		: null;

	const [date, setDate] = useState<string>(() => toIsoDate(new Date()));
	const [startTime, setStartTime] = useState<string>(() => timeOptions[0] || "08:00");
	const [reason, setReason] = useState<string>("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			setError(null);
			setSubmitting(false);
		}
	}, [open]);

	const canSubmit = Boolean(
		open &&
		patientId &&
		accessToken &&
		selectedDoctorId &&
		date &&
		startTime &&
		!submitting,
	);

	const endTime = addMinutes(startTime, 30);

	const handleConfirm = async () => {
		setError(null);
		if (!patientId) {
			setError("Missing patientId (please login again).");
			return;
		}
		if (!accessToken) {
			setError("Missing access token (please login again).");
			return;
		}
		if (!selectedDoctorId) {
			setError("Please select a doctor.");
			return;
		}

		setSubmitting(true);
		try {
			await createBookingFromPanel(
				{
					doctorId: selectedDoctorId,
					date,
					startTime,
					endTime,
					patientId,
					reason: reason.trim() || undefined,
				},
				{ accessToken },
			);

			onToast("Booking confirmed.", "success");
			onBooked();
			onClose();
		} catch (e: any) {
			const message = e?.message || "Booking failed";
			setError(message);
			onToast(message, "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-lg font-semibold text-gray-900">Booking Panel</h2>
					<p className="mt-1 text-sm text-gray-600">
						{open
							? "Create a new appointment without leaving the page."
							: "Select a doctor to start booking."}
					</p>
				</div>
			</div>

			{open ? (
				<div className="mt-6 space-y-5">
					{!selectedDoctor ? (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Doctor
							</label>
							<select
								value={selectedDoctorId || ""}
								onChange={(e) => onSelectDoctorId(e.target.value || null)}
								className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="" disabled>
									Select a doctor
								</option>
								{doctors.map((d) => (
									<option key={d.id} value={d.id}>
										{d.name} — {d.specialty || "General"}
									</option>
								))}
							</select>
						</div>
					) : (
						<div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
							<div className="h-12 w-12 overflow-hidden rounded-full bg-white ring-1 ring-gray-200">
								{selectedDoctor.avatar ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={selectedDoctor.avatar}
										alt={selectedDoctor.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
										{initials(selectedDoctor.name)}
									</div>
								)}
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-gray-900">{selectedDoctor.name}</p>
								<p className="truncate text-sm text-blue-600">{selectedDoctor.specialty || "General"}</p>
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Date</label>
							<input
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Time</label>
							<select
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{timeOptions.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
							<p className="mt-1 text-xs text-gray-500">Times are restricted to 08:00–20:00.</p>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
						<textarea
							rows={3}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Add details for the doctor (optional)"
						/>
					</div>

					{error ? (
						<div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">
							{error}
						</div>
					) : null}

					<div className="flex gap-3">
						<button
							type="button"
							onClick={handleConfirm}
							disabled={!canSubmit}
							className={
								"flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
								(canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300")
							}
						>
							{submitting ? "Booking…" : "Confirm Booking"}
						</button>
						<button
							type="button"
							onClick={onClose}
							className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
						>
							Cancel
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}
