import app from './app';
import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';
import { Server } from 'socket.io';
import http from 'http';

const PORT = Number(process.env.PORT) || 5000;
const httpServer = http.createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ["https://www.estilo-co.ma", "https://estilo-co.ma", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

let liveVisitors = 0;

io.on('connection', (socket) => {
  liveVisitors++;
  io.emit('live-count', liveVisitors);

  socket.on('disconnect', () => {
    liveVisitors = Math.max(0, liveVisitors - 1);
    io.emit('live-count', liveVisitors);
  });
});

const createInitialAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@estilo-co.com' },
      update: {},
      create: {
        email: 'admin@estilo-co.com',
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

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server with WebSockets is active on port ${PORT}`);
  await createInitialAdmin();
});

// Error handling
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, 'reason:', reason); });
