import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@estilo-co.com' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'admin@estilo-co.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created/updated:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
