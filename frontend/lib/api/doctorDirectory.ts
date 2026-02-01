import api from "@/lib/api";

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

export interface DoctorProfile {
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
  data: DoctorProfile[];
}

export async function getDoctorDirectory(): Promise<DoctorDirectoryItem[]> {
  const response = await api.get("/users/doctors");
  const payload = response.data as DoctorsListResponse | DoctorProfile[];
  const doctors = Array.isArray(payload) ? payload : payload.data;

  return doctors.map((doctor) => {
    const name = `Dr. ${doctor.firstName} ${doctor.lastName}`.trim();
    return {
      id: doctor.id,
      name,
      specialty: doctor.specialty || null,
      avatar: doctor.avatar || null,
      bio: doctor.bio || null,
      nextAvailable: null,
      location: doctor.clinicAddress || null,
      rating: 0,
    };
  });
}

export async function getDoctorProfile(id: string): Promise<DoctorProfile> {
  const response = await api.get(`/users/doctors/${id}`);
  return response.data as DoctorProfile;
}
