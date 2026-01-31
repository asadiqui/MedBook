import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

export type DoctorListItem = {
  id: string;
  name: string;
  specialty: string | null;
  avatar: string | null;
  bio: string | null;
  nextAvailable: string | null;
  location: string | null;
  rating: number;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function ratingFromYears(yearsOfExperience: number | null): number {
  if (yearsOfExperience == null) return 4.5;
  const base = 4.0 + clamp(yearsOfExperience, 0, 20) * 0.05; // 4.0 → 5.0
  return Math.round(clamp(base, 0, 5) * 10) / 10;
}

function isoFromDateAndTime(date: string, time: string): string {
  // Store times as "Z" so the client can treat it as an instant.
  return new Date(`${date}T${time}:00.000Z`).toISOString();
}

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDoctors(): Promise<DoctorListItem[]> {
    const doctors = await this.prisma.user.findMany({
      where: { role: Role.DOCTOR, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: true,
        avatar: true,
        bio: true,
        affiliation: true,
        clinicAddress: true,
        yearsOfExperience: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (doctors.length === 0) return [];

    const doctorIds = doctors.map((d) => d.id);
    const todayIso = new Date().toISOString().slice(0, 10);

    const availabilities = await this.prisma.availability.findMany({
      where: {
        doctorId: { in: doctorIds },
        date: { gte: todayIso },
      },
      select: {
        doctorId: true,
        date: true,
        startTime: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const nextByDoctor = new Map<string, { date: string; startTime: string }>();
    for (const a of availabilities) {
      if (!nextByDoctor.has(a.doctorId)) {
        nextByDoctor.set(a.doctorId, { date: a.date, startTime: a.startTime });
      }
    }

    return doctors.map((d) => {
      const name = `${d.firstName} ${d.lastName}`.trim();
      const next = nextByDoctor.get(d.id);
      const nextAvailable = next ? isoFromDateAndTime(next.date, next.startTime) : null;
      const location = d.affiliation || d.clinicAddress || null;

      return {
        id: d.id,
        name,
        specialty: d.specialty ?? null,
        avatar: d.avatar ?? null,
        bio: d.bio ?? null,
        nextAvailable,
        location,
        rating: ratingFromYears(d.yearsOfExperience ?? null),
      };
    });
  }
}
