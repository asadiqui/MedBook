import { apiRequest } from "./apiClient";

export type DoctorDirectoryItem = {
	id: string;
	name: string;
	specialty: string | null;
	avatar: string | null;
	bio: string | null;
	nextAvailable: string | null;
	location: string | null;
	rating: number;
};

// GET /api/doctors
export function getDoctorDirectory(): Promise<DoctorDirectoryItem[]> {
	return apiRequest<DoctorDirectoryItem[]>("/doctors");
}
