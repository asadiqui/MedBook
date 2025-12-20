import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doctor = await prisma.user.create({
    data: {
      role: Role.DOCTOR,
    },
  });

  const patient = await prisma.user.create({
    data: {
      role: Role.PATIENT,
    },
  });

  console.log({ doctor, patient });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
