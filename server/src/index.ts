import app from './app';
import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';

const PORT = Number(process.env.PORT) || 5000;

const createInitialAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@esito-co.com' },
      update: {},
      create: {
        email: 'admin@esito-co.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
      },
    });
    console.log('✅ Initial admin account verified/created.');
  } catch (err) {
    console.error('❌ Error creating initial admin:', err);
  }
};

const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server is active on http://localhost:${PORT}`);
  await createInitialAdmin();
});

// Keep process alive
process.stdin.resume();

// Error handling to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
