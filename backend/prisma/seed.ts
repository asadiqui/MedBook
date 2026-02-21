import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedUsers } from '../config/seedUsers';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('Seed');

async function main() {
  if (process.env.SEED_DB !== 'true') {
    logger.log('Skipping seed (set SEED_DB=true to enable)');
    return;
  }

  if (!seedUsers.admin.password || seedUsers.doctors.some(d => !d.password)) {
    throw new Error('Seed passwords are missing. Check all SEED_*_PASSWORD env vars.');
  }


  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(seedUsers.admin.password, 12);
    const admin = await prisma.user.create({
      data: {
        email: seedUsers.admin.email,
        password: hashedPassword,
        firstName: seedUsers.admin.firstName,
        lastName: seedUsers.admin.lastName,
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true,
      },
    });
    logger.log(`Admin account created successfully: ${admin.email}`);
  } else {
    logger.log(`Admin account already exists: ${existingAdmin.email}`);
  }

  for (const doctorData of seedUsers.doctors) {
    const existingDoctor = await prisma.user.findUnique({ where: { email: doctorData.email } });
    if (!existingDoctor) {
      const hashedPassword = await bcrypt.hash(doctorData.password, 12);
      const doctor = await prisma.user.create({
        data: {
          email: doctorData.email,
          password: hashedPassword,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          role: Role.DOCTOR,
          phone: doctorData.phone,
          specialty: doctorData.specialty,
          bio: doctorData.bio,
          consultationFee: doctorData.consultationFee,
          affiliation: doctorData.affiliation,
          yearsOfExperience: doctorData.yearsOfExperience,
          clinicAddress: doctorData.clinicAddress,
          clinicContactPerson: doctorData.clinicContactPerson,
          clinicPhone: doctorData.clinicPhone,
          isActive: true,
          isEmailVerified: true,
          isVerified: true,
        },
      });
      logger.log(`Doctor account created successfully: ${doctor.email}`);
    } else {
      logger.log(`Doctor account already exists: ${existingDoctor.email}`);
    }
  }

  const seedDoctors = await prisma.user.findMany({
    where: { email: { in: seedUsers.doctors.map(d => d.email) } },
  });

  for (const doctor of seedDoctors) {
    const existingAvailability = await prisma.availability.findFirst({
      where: { doctorId: doctor.id },
    });
    if (!existingAvailability) {
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() + 1);
      await prisma.availability.create({
        data: {
          doctorId: doctor.id,
          date: date.toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      logger.log(`Created availability slot for doctor: ${doctor.email}`);
    } else {
      logger.log(`Availability already exists for doctor: ${doctor.email}`);
    }
  }
}

main()
  .catch((e) => {
    logger.error('Seeding failed', e instanceof Error ? e.stack : `${e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
