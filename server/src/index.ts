import app from './app';

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is active on http://localhost:${PORT}`);
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
