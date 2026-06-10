import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import config from './config/index.js';
import logger from './config/logger.js';
import { connectRedis } from './config/redis.js';
import { initializeSocket } from './sockets/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, '../logs'),
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/avatars'),
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};

const startServer = async () => {
  try {
    ensureDirectories();
    await connectRedis();

    const server = http.createServer(app);
    initializeSocket(server);

    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        env: config.env,
        docs: `http://localhost:${config.port}/api/docs`,
      });
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
