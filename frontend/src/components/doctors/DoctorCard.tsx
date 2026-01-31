import React from "react";
import type { DoctorDirectoryItem } from "../../api/doctorDirectory.api";

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
		</svg>
	);
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
			<path d="M8 2v4M16 2v4M3 10h18" />
			<path d="M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
		</svg>
	);
}

function LocationIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
			<path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z" />
			<path d="M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
		</svg>
	);
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

function availabilityLabel(nextAvailableIso: string | null): string {
	if (!nextAvailableIso) return "No availability";
	const d = new Date(nextAvailableIso);
	const today = new Date();

	const isSameDay =
		d.getFullYear() === today.getFullYear() &&
		d.getMonth() === today.getMonth() &&
		d.getDate() === today.getDate();

	const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
	if (isSameDay) return `Available Today, ${time}`;

	const date = d.toLocaleDateString([], { month: "short", day: "numeric" });
	return `Available ${date}, ${time}`;
}

export type DoctorCardProps = {
	doctor: DoctorDirectoryItem;
	selected?: boolean;
	onSelect: (doctorId: string) => void;
};

export default function DoctorCard({ doctor, selected, onSelect }: DoctorCardProps) {
	const label = availabilityLabel(doctor.nextAvailable);
	const hasAvailability = Boolean(doctor.nextAvailable);

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onSelect(doctor.id)}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
				if (e.key === "Enter" || e.key === " ") onSelect(doctor.id);
			}}
			className={
				"relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 " +
				(selected ? "ring-2 ring-blue-200" : "")
			}
		>
			<div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
				<StarIcon className="h-4 w-4 text-amber-500" />
				<span>{Number.isFinite(doctor.rating) ? doctor.rating.toFixed(1) : "—"}</span>
			</div>

			<div className="flex gap-4">
				<div className="relative h-16 w-16 shrink-0">
					<div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
						{doctor.avatar ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={doctor.avatar}
								alt={doctor.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
								{initials(doctor.name)}
							</div>
						)}
					</div>
					<span
						aria-label="Online"
						className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white"
					/>
				</div>

				<div className="min-w-0 flex-1">
					<h3 className="truncate text-2xl font-semibold text-gray-900">{doctor.name}</h3>
					<div className="mt-1">
						<span className="cursor-pointer text-lg font-medium text-blue-600 hover:underline">
							{doctor.specialty || "General"}
						</span>
					</div>

					<p className="mt-3 max-h-12 overflow-hidden text-base text-gray-600">
						{doctor.bio || "No bio available."}
					</p>

					<div className="my-4 h-px w-full bg-gray-100" />

					<div className="space-y-2">
						<div
							className={
								"flex items-center gap-2 text-sm " +
								(hasAvailability ? "text-emerald-600" : "text-gray-500")
							}
						>
							<CalendarIcon className="h-5 w-5" />
							<span className="font-medium">{label}</span>
						</div>

						<div className="flex items-center gap-2 text-sm text-gray-600">
							<LocationIcon className="h-5 w-5 text-gray-500" />
							<span className="truncate">{doctor.location || "Location not provided"}</span>
						</div>
					</div>

					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onSelect(doctor.id);
						}}
						className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Book Appointment
					</button>
				</div>
			</div>
		</div>
	);
}
