import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (existingAdmin) {
    console.log('✅ Admin account already exists:', existingAdmin.email);
    return;
  }

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
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
