import { AvailabilitySlot } from "../../types/availability";
import { Booking } from "../../api/booking.api";
import BookingCard from "./BookingCard";

export type SlotState = "available" | "unavailable";

export interface BookingListProps {
	// Availability slots (used in patient find-doctor flow)
	slots?: AvailabilitySlot[];
	// Doctor bookings (used in doctor bookings page)
	bookings?: Booking[];
	onAcceptBooking?: (booking: Booking) => void | Promise<void>;
	onRejectBooking?: (booking: Booking) => void | Promise<void>;
	bookingActionLoading?: { id: string; action: "accept" | "reject" } | null;
	selectedSlotId?: string | null;
	onSelectSlot?: (slot: AvailabilitySlot) => void;
	getSlotState?: (slot: AvailabilitySlot) => SlotState;
	emptyText?: string;
}

export default function BookingList({
	slots = [],
	bookings,
	onAcceptBooking,
	onRejectBooking,
	bookingActionLoading = null,
	selectedSlotId = null,
	onSelectSlot,
	getSlotState,
	emptyText = "No slots available.",
}: BookingListProps) {
	if (bookings) {
		if (bookings.length === 0) {
			return <p className="text-sm text-gray-600">{emptyText}</p>;
		}

		return (
			<div className="space-y-2">
				{bookings.map((b) => (
					<BookingCard
						key={b.id}
						booking={b}
						onAccept={onAcceptBooking ? () => onAcceptBooking(b) : undefined}
						onReject={onRejectBooking ? () => onRejectBooking(b) : undefined}
						actionLoading={
							bookingActionLoading?.id === b.id
								? bookingActionLoading.action
								: null
						}
					/>
				))}
			</div>
		);
	}

	if (slots.length === 0) {
		return <p className="text-sm text-gray-600">{emptyText}</p>;
	}

	return (
		<div className="space-y-2">
			{slots.map((slot) => {
				const state = getSlotState?.(slot) ?? "available";
				const isUnavailable = state === "unavailable";
				const isSelected = selectedSlotId === slot.id;

				return (
					<div
						key={slot.id}
						role={isUnavailable ? undefined : "button"}
						tabIndex={isUnavailable ? -1 : 0}
						aria-disabled={isUnavailable}
						onClick={() => {
							if (isUnavailable) return;
							onSelectSlot?.(slot);
						}}
						onKeyDown={(e) => {
							if (isUnavailable) return;
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onSelectSlot?.(slot);
							}
						}}
						className={`flex items-center justify-between rounded-md border px-3 py-2 transition
							focus:outline-none focus:ring-2 focus:ring-blue-500/40
							${
								isUnavailable
									? "cursor-not-allowed bg-gray-50 opacity-60"
									: "cursor-pointer bg-white hover:border-blue-400 hover:shadow-sm active:scale-[0.99]"
							}
							${isSelected ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500/30" : ""}`}
					>
						<div className="text-sm text-gray-800">
							<span className="font-medium">{slot.date}</span>
							<span className="mx-2 text-gray-400">•</span>
							<span>
								{slot.startTime} - {slot.endTime}
							</span>
						</div>

						<span
							className={`rounded-full px-2 py-0.5 text-xs font-semibold
								${
									isUnavailable
										? "bg-gray-200 text-gray-700"
										: "bg-green-100 text-green-800"
								}`}
						>
							{isUnavailable ? "Unavailable" : "Available"}
						</span>
					</div>
				);
			})}
		</div>
	);
}
