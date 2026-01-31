import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Booking,
	cancelBooking as cancelBookingApi,
	createBooking as createBookingApi,
	CreateBookingDto,
	getMyBookings as getMyBookingsApi,
} from "../api/booking.api";
import { getAccessToken } from "../utils/authStorage";

export type UseBookingsOptions = {
	enabled?: boolean;
	accessToken?: string;
};

function getTokenFromStorage(): string | undefined {
	return getAccessToken() || undefined;
}

export function useBookings(options: UseBookingsOptions = {}) {
	const { enabled = true, accessToken } = options;

	const resolvedAccessToken = useMemo(
		() => accessToken ?? getTokenFromStorage(),
		[accessToken],
	);

	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const [creating, setCreating] = useState<boolean>(false);
	const [createError, setCreateError] = useState<string | null>(null);

	const [cancellingId, setCancellingId] = useState<string | null>(null);
	const [cancelError, setCancelError] = useState<string | null>(null);

	const refetch = useCallback(async () => {
		if (!enabled) {
			setBookings([]);
			setLoading(false);
			return;
		}

		try {
			setError(null);
			setLoading(true);
			const data = await getMyBookingsApi({ accessToken: resolvedAccessToken });
			setBookings(data);
		} catch (err: any) {
			setError(err?.message || "Failed to load bookings");
		} finally {
			setLoading(false);
		}
	}, [enabled, resolvedAccessToken]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	const create = useCallback(
		async (dto: CreateBookingDto) => {
			try {
				setCreateError(null);
				setCreating(true);

				const created = await createBookingApi(dto, {
					accessToken: resolvedAccessToken,
				});

				// Keep hook as single source of truth: update list immediately.
				setBookings((prev) => [created, ...prev]);
				return created;
			} catch (err: any) {
				const message = err?.message || "Failed to create booking";
				setCreateError(message);
				throw err;
			} finally {
				setCreating(false);
			}
		},
		[resolvedAccessToken],
	);

	const cancel = useCallback(
		async (id: string) => {
			try {
				setCancelError(null);
				setCancellingId(id);

				const updated = await cancelBookingApi(id, {
					accessToken: resolvedAccessToken,
				});

				setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
				return updated;
			} catch (err: any) {
				setCancelError(err?.message || "Failed to cancel booking");
				throw err;
			} finally {
				setCancellingId(null);
			}
		},
		[resolvedAccessToken],
	);

	return {
		bookings,
		loading,
		error,

		creating,
		createError,
		createBooking: create,

		cancellingId,
		cancelError,
		cancelBooking: cancel,

		refetch,
	};
}

