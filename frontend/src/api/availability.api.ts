import { apiRequest } from './apiClient';
import { Availabilityslot } from '../types/availability'

type AuthOptions = {
  accessToken?: string;
};

function authHeaders(accessToken?: string): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export interface CreateAvailabilityDto {
  doctorId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
}

export function createAvailability(dto: CreateAvailabilityDto, options: AuthOptions = {}) {
    return apiRequest<Availabilityslot>('/availability', {
        method: 'POST',
        body: dto,
		headers: {
			...authHeaders(options.accessToken),
		},
    });
}

export type GetAvailabilityParams = {
  doctorId?: string;
  date?: string; // YYYY-MM-DD
};

export function getAvailability(params: GetAvailabilityParams = {}, options: AuthOptions = {}) {
  const searchParams = new URLSearchParams();
  if (params.doctorId) searchParams.set('doctorId', params.doctorId);
  if (params.date) searchParams.set('date', params.date);

  const query = searchParams.toString();
  const path = query ? `/availability?${query}` : '/availability';
  return apiRequest<Availabilityslot[]>(path, {
    headers: {
      ...authHeaders(options.accessToken),
    },
  });
}

export function deleteAvailability(id: string, options: AuthOptions = {}) {
  return apiRequest<void>(`/availability/${id}`, {
    method: "DELETE",
		headers: {
			...authHeaders(options.accessToken),
		},
  });
}

// Backwards compatible helper
export function getDoctorAvailability(doctorId: string) {
  return getAvailability({ doctorId });
}