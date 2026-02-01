
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedUsers } from '../config/seedUsers';

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_DB !== 'true') {
    console.log('ℹ️  Skipping seed (set SEED_DB=true to enable)');
    return;
  }

  if (!seedUsers.admin.password || !seedUsers.doctor.password || !seedUsers.patient.password) {
    throw new Error('Seed passwords are missing. Set SEED_ADMIN_PASSWORD, SEED_DOCTOR_PASSWORD, and SEED_PATIENT_PASSWORD.');
  }


  // Check if admin already exists
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
    console.log('✅ Admin account created successfully!');
    console.log('   Email:', admin.email);
    console.log('');
  } else {
    console.log('✅ Admin account already exists:', existingAdmin.email);
  }


  // Check if doctor already exists
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
    console.log('✅ Doctor account created successfully!');
    console.log('   Email:', doctor.email);
    console.log('');
  } else {
    console.log('✅ Doctor account already exists:', existingDoctor.email);
  }


  // Check if patient already exists
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
    console.log('✅ Patient account created successfully!');
    console.log('   Email:', patient.email);
    console.log('');
  } else {
    console.log('✅ Patient account already exists:', existingPatient.email);
  }

  // Create some availability for the doctor
  const doctorForAvailability = await prisma.user.findFirst({
    where: { role: Role.DOCTOR },
  });

  if (doctorForAvailability) {
    // Check if availability already exists
    const existingAvailability = await prisma.availability.findFirst({
      where: { doctorId: doctorForAvailability.id },
    });

    if (!existingAvailability) {
      // Create availability for next day only
      const availabilities = [];
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() + 1);

      availabilities.push({
        doctorId: doctorForAvailability.id,
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime: '09:00',
        endTime: '17:00',
      });

      for (const availability of availabilities) {
        await prisma.availability.create({
          data: availability,
        });
      }

      console.log(`✅ Created ${availabilities.length} availability slots for the doctor`);
      console.log('');
    } else {
      console.log('✅ Doctor availability already exists');
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
