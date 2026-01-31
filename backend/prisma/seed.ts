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
        dateOfBirth: "1990-01-01T00:00:00.000Z",
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

  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   Doctor: doctor@medbook.com / Doctor123!@#');
  console.log('   Patient: patient@medbook.com / Patient123!@#');
  console.log('   Admin: admin@medbook.com / Admin123!@#');
  console.log('');
  console.log('ℹ️  No availability created - you can create it manually through the doctor dashboard');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
