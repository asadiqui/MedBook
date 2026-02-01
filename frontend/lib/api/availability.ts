import api from "@/lib/api";

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface CreateAvailabilityDto {
  date: string;
  startTime: string;
  endTime: string;
}

export type AvailabilityCalendar = Record<
  string,
  Array<{ id: string; startTime: string; endTime: string }>
>;

export async function createAvailability(dto: CreateAvailabilityDto) {
  const response = await api.post("/availability", dto);
  return response.data as AvailabilitySlot;
}

export async function getAvailability(params: {
  doctorId: string;
  date?: string;
}) {
  const response = await api.get("/availability", { params });
  return response.data as AvailabilitySlot[];
}

export async function getMyAvailability(date?: string) {
  const response = await api.get("/availability/me", {
    params: date ? { date } : undefined,
  });
  return response.data as AvailabilitySlot[];
}

export async function deleteAvailability(id: string) {
  const response = await api.delete(`/availability/${id}`);
  return response.data as { success: boolean };
}

export async function getAvailabilityCalendar(params: {
  doctorId: string;
  from: string;
  to: string;
}) {
  const response = await api.get("/availability/calendar", { params });
  return response.data as AvailabilityCalendar;
}
