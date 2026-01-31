import { apiRequest } from "./apiClient";

export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface CreateBookingDto {
	doctorId: string;
	date: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	duration: number; // minutes (60 or 120)
	reason?: string;
}

export interface CreateBookingPanelDto {
	doctorId: string;
	date: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	patientId: string;
	reason?: string;
}

export interface BookingUserSummary {
	id: string;
	firstName: string;
	lastName: string;
	avatar?: string | null;
	specialty?: string | null;
	affiliation?: string | null;
	clinicAddress?: string | null;
	phone?: string | null;
	email?: string | null;
}

export interface Booking {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	duration: number;
	reason?: string | null;
	status: BookingStatus;
	doctorId: string;
	patientId: string;
	doctor?: BookingUserSummary;
	patient?: BookingUserSummary;
	createdAt?: string;
	updatedAt?: string;
}

type AuthOptions = {
	accessToken?: string;
};

function authHeaders(accessToken?: string): Record<string, string> {
	return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// POST /booking
export function createBooking(data: CreateBookingDto, options: AuthOptions = {}) {
	return apiRequest<Booking>("/booking", {
		method: "POST",
		body: data,
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// POST /booking (panel contract)
export function createBookingFromPanel(
	data: CreateBookingPanelDto,
	options: AuthOptions = {},
) {
	return apiRequest<Booking>("/booking", {
		method: "POST",
		body: data,
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// GET /booking/me
export function getMyBookings(options: AuthOptions = {}) {
	return apiRequest<Booking[]>("/booking/me", {
		method: "GET",
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// GET /booking/doctor?status=PENDING|ACCEPTED|REJECTED|CANCELLED
export function getDoctorBookings(options: AuthOptions = {}, params: { status?: BookingStatus } = {}) {
	const query = params.status ? `?status=${encodeURIComponent(params.status)}` : "";
	return apiRequest<Booking[]>(`/booking/doctor${query}`, {
		method: "GET",
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// GET /booking/doctor/:id?date=YYYY-MM-DD
export function getDoctorSchedule(
	doctorId: string,
	params: { date?: string } = {},
	options: AuthOptions = {},
) {
	const query = params.date ? `?date=${encodeURIComponent(params.date)}` : "";
	return apiRequest<Booking[]>(`/booking/doctor/${doctorId}${query}`, {
		method: "GET",
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// PATCH /booking/:id/cancel
export function cancelBooking(id: string, options: AuthOptions = {}) {
	return apiRequest<Booking>(`/booking/${id}/cancel`, {
		method: "PATCH",
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// PATCH /booking/:id/accept
export function acceptBooking(id: string, options: AuthOptions = {}) {
	return apiRequest<Booking>(`/booking/${id}/accept`, {
		method: "PATCH",
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}

// PATCH /booking/:id/reject
export function rejectBooking(id: string, options: AuthOptions = {}) {
	return apiRequest<Booking>(`/booking/${id}/reject`, {
		method: "PATCH",
		headers: {
			...authHeaders(options.accessToken),
		},
	});
}
