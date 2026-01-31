import { apiRequest } from "./apiClient";

export interface Doctor {
	id: string;
	firstName: string;
	lastName: string;
	specialty?: string | null;
	bio?: string | null;
	avatar?: string | null;
	consultationFee?: number | null;
	affiliation?: string | null;
	yearsOfExperience?: number | null;
	clinicAddress?: string | null;
}

interface DoctorsListResponse {
	data: Doctor[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export type GetDoctorsParams = {
	search?: string;
	specialty?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
};

export async function getDoctors(
	params: GetDoctorsParams = {},
): Promise<Doctor[]> {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") continue;
		searchParams.set(key, String(value));
	}

	const query = searchParams.toString();
	const path = query ? `/users/doctors?${query}` : "/users/doctors";

	const res = await apiRequest<DoctorsListResponse>(path);
	return res.data;
}
