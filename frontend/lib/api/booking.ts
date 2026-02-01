import api from "@/lib/api";

export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface CreateBookingDto {
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  duration: number; // minutes (60 or 120)
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

export async function createBooking(data: CreateBookingDto) {
  const response = await api.post("/booking", data);
  return response.data as Booking;
}

export async function getPatientBookings() {
  const response = await api.get("/booking/patient");
  return response.data as Booking[];
}

export async function getDoctorBookings() {
  const response = await api.get("/booking/doctor");
  return response.data as Booking[];
}

export async function getDoctorSchedule(doctorId: string, date?: string) {
  const response = await api.get(`/booking/doctor/${doctorId}`, {
    params: date ? { date } : undefined,
  });
  return response.data as Booking[];
}

export async function cancelBooking(id: string) {
  const response = await api.patch(`/booking/${id}/cancel`);
  return response.data as Booking;
}

export async function acceptBooking(id: string) {
  const response = await api.patch(`/booking/${id}/accept`);
  return response.data as Booking;
}

export async function rejectBooking(id: string) {
  const response = await api.patch(`/booking/${id}/reject`);
  return response.data as Booking;
}
