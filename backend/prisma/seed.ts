import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!existingAdmin) {
    // Create admin account
    const hashedPassword = await bcrypt.hash('Admin123!@#', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@medbook.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'MedBook',
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Password: Admin123!@#');
    console.log('');
  } else {
    console.log('✅ Admin account already exists:', existingAdmin.email);
  }

  // Check if doctor already exists
  const existingDoctor = await prisma.user.findFirst({
    where: { role: Role.DOCTOR },
  });

  if (!existingDoctor) {
    // Create doctor account
    const doctorHashedPassword = await bcrypt.hash('Doctor123!@#', 12);

    const doctor = await prisma.user.create({
      data: {
        email: 'doctor@medbook.com',
        password: doctorHashedPassword,
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: Role.DOCTOR,
        phone: '+1234567890',
        specialty: 'Cardiology',
        bio: 'Experienced cardiologist with over 15 years of practice. Specializes in heart disease prevention and treatment.',
        consultationFee: 150,
        affiliation: 'City General Hospital',
        yearsOfExperience: 15,
        clinicAddress: '123 Medical Center Dr, Suite 456',
        clinicContactPerson: 'Jane Smith',
        clinicPhone: '+1234567891',
        isActive: true,
        isEmailVerified: true,
        isVerified: true,
      },
    });

    console.log('✅ Doctor account created successfully!');
    console.log('   Email:', doctor.email);
    console.log('   Password: Doctor123!@#');
    console.log('');
  } else {
    console.log('✅ Doctor account already exists:', existingDoctor.email);
  }

  // Check if patient already exists
  const existingPatient = await prisma.user.findFirst({
    where: { role: Role.PATIENT },
  });

  if (!existingPatient) {
    // Create patient account
    const patientHashedPassword = await bcrypt.hash('Patient123!@#', 12);

    const patient = await prisma.user.create({
      data: {
        email: 'patient@medbook.com',
        password: patientHashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: Role.PATIENT,
        phone: '+1234567892',
        dateOfBirth: '1990-01-01',
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log('✅ Patient account created successfully!');
    console.log('   Email:', patient.email);
    console.log('   Password: Patient123!@#');
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
      // Create availability for next 7 days
      const availabilities = [];
      const today = new Date();

      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Skip weekends for this example
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          availabilities.push({
            doctorId: doctorForAvailability.id,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD format
            startTime: '09:00',
            endTime: '17:00',
          });
        }
      }

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
