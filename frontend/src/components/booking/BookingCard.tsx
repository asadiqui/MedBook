import { Booking } from "../../api/booking.api";

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

export interface BookingCardProps {
	booking: Booking;
	onAccept?: () => void | Promise<void>;
	onReject?: () => void | Promise<void>;
	actionLoading?: "accept" | "reject" | null;
}

export default function BookingCard({
	booking,
	onAccept,
	onReject,
	actionLoading = null,
}: BookingCardProps) {
	const patientLabel = booking.patient
		? `${booking.patient.firstName} ${booking.patient.lastName}`
		: `Patient ${booking.patientId}`;

	const canAct = booking.status === "PENDING";
	const showActions = Boolean(onAccept || onReject);

	return (
		<div className="flex flex-wrap items-center justify-between gap-4 rounded-md border bg-white px-3 py-3">
			<div className="min-w-0">
				<div className="font-semibold text-gray-900 truncate">{patientLabel}</div>
				<div className="mt-1 text-sm text-gray-600">
					<span className="font-medium">{booking.date}</span>
					<span className="mx-2 text-gray-300">•</span>
					<span>
						{booking.startTime}–{booking.endTime}
					</span>
				</div>
			</div>

		<div className="flex shrink-0 items-center gap-2">
			<span
				className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
					booking.status,
				)}`}
			>
				{booking.status}
			</span>

			{showActions && (
				<div className="flex items-center gap-2">
					<button
						type="button"
						disabled={!canAct || actionLoading !== null}
						onClick={() => onAccept?.()}
						className={`rounded-md px-3 py-2 text-xs font-semibold text-white transition
							${
								!canAct || actionLoading !== null
									? "cursor-not-allowed bg-green-300"
									: "bg-green-600 hover:bg-green-700"
							}`}
					>
						{actionLoading === "accept" ? "Accepting..." : "Accept"}
					</button>

					<button
						type="button"
						disabled={!canAct || actionLoading !== null}
						onClick={() => onReject?.()}
						className={`rounded-md border px-3 py-2 text-xs font-semibold transition
							${
								!canAct || actionLoading !== null
									? "cursor-not-allowed border-red-200 bg-red-50 text-red-300"
									: "border-red-200 bg-white text-red-700 hover:bg-red-50"
							}`}
					>
						{actionLoading === "reject" ? "Rejecting..." : "Reject"}
					</button>
				</div>
			)}
		</div>
		</div>
	);
}

