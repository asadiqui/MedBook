import { Booking } from "../../api/booking.api";
import BookingCard from "./BookingCard";

export interface DoctorBookingListProps {
	bookings: Booking[];
	emptyText?: string;
}

export default function DoctorBookingList({
	bookings,
	emptyText = "No bookings found.",
}: DoctorBookingListProps) {
	if (bookings.length === 0) {
		return <p className="text-sm text-gray-600">{emptyText}</p>;
	}

	return (
		<div className="space-y-2">
			{bookings.map((b) => (
				<BookingCard key={b.id} booking={b} />
			))}
		</div>
	);
}
