import app from './app.js';
import prisma from './config/db.js';
import env from './config/env.js';

let server;

const startServer = async () => {
  try
  {
    await prisma.$connect();
    console.log('Database connected successfully');

    server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error)
  {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  if (server)
  {
    server.close(() => process.exit(1));
    return;
  }

  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();

  if (server)
  {
    server.close(() => process.exit(0));
    return;
  }

  process.exit(0);
});
