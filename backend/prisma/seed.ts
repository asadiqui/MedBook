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

  if (!seedUsers.admin.password || !seedUsers.doctor.password || !seedUsers.patient.password) {
    throw new Error('Seed passwords are missing. Set SEED_ADMIN_PASSWORD, SEED_DOCTOR_PASSWORD, and SEED_PATIENT_PASSWORD.');
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

  const existingDoctor = await prisma.user.findFirst({
    where: { role: Role.DOCTOR },
  });

  if (!existingDoctor) {
    const doctorHashedPassword = await bcrypt.hash(seedUsers.doctor.password, 12);
    const doctor = await prisma.user.create({
      data: {
        email: seedUsers.doctor.email,
        password: doctorHashedPassword,
        firstName: seedUsers.doctor.firstName,
        lastName: seedUsers.doctor.lastName,
        role: Role.DOCTOR,
        phone: seedUsers.doctor.phone,
        specialty: seedUsers.doctor.specialty,
        bio: seedUsers.doctor.bio,
        consultationFee: seedUsers.doctor.consultationFee,
        affiliation: seedUsers.doctor.affiliation,
        yearsOfExperience: seedUsers.doctor.yearsOfExperience,
        clinicAddress: seedUsers.doctor.clinicAddress,
        clinicContactPerson: seedUsers.doctor.clinicContactPerson,
        clinicPhone: seedUsers.doctor.clinicPhone,
        isActive: true,
        isEmailVerified: true,
        isVerified: true,
      },
    });
    logger.log(`Doctor account created successfully: ${doctor.email}`);
  } else {
    logger.log(`Doctor account already exists: ${existingDoctor.email}`);
  }

  const existingPatient = await prisma.user.findFirst({
    where: { role: Role.PATIENT },
  });

  if (!existingPatient) {
    const patientHashedPassword = await bcrypt.hash(seedUsers.patient.password, 12);
    const patient = await prisma.user.create({
      data: {
        email: seedUsers.patient.email,
        password: patientHashedPassword,
        firstName: seedUsers.patient.firstName,
        lastName: seedUsers.patient.lastName,
        role: Role.PATIENT,
        phone: seedUsers.patient.phone,
        dateOfBirth: seedUsers.patient.dateOfBirth,
        isActive: true,
        isEmailVerified: true,
      },
    });
    logger.log(`Patient account created successfully: ${patient.email}`);
  } else {
    logger.log(`Patient account already exists: ${existingPatient.email}`);
  }

  const doctorForAvailability = await prisma.user.findFirst({
    where: { role: Role.DOCTOR },
  });

  if (doctorForAvailability) {
    const existingAvailability = await prisma.availability.findFirst({
      where: { doctorId: doctorForAvailability.id },
    });

    if (!existingAvailability) {
      const availabilities = [];
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() + 1);

      availabilities.push({
        doctorId: doctorForAvailability.id,
        date: date.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
      });

      for (const availability of availabilities) {
        await prisma.availability.create({
          data: availability,
        });
      }

      logger.log(`Created ${availabilities.length} availability slots for the doctor`);
    } else {
      logger.log('Doctor availability already exists');
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
