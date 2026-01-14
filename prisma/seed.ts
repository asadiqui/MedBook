
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ...existing code...

  // Create admin account
  const adminHashedPassword = await bcrypt.hash('Admin123!@#', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medbook.com' },
    update: {},
    create: {
      email: 'admin@medbook.com',
      password: adminHashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890',
      dateOfBirth: new Date('1985-01-01'),
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create doctor account
  const doctorHashedPassword = await bcrypt.hash('Doctor123!@#', 12);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@medbook.com' },
    update: {},
    create: {
      email: 'doctor@medbook.com',
      password: doctorHashedPassword,
      firstName: 'Dr. Jane',
      lastName: 'Smith',
      role: 'DOCTOR',
      phone: '+1234567891',
      dateOfBirth: new Date('1980-01-01'),
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Create patient account
  const patientHashedPassword = await bcrypt.hash('Patient123!@#', 12);
  const patient = await prisma.user.create({
    data: {
      email: 'patient@medbook.com',
      password: patientHashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'PATIENT',
      phone: '+1234567892',
      dateOfBirth: new Date('1990-01-01'),
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log('✅ Seeding completed successfully');
  console.log({ admin, doctor, patient });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });