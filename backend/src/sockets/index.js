import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import logger from '../config/logger.js';
import { redisSub } from '../config/redis.js';
import { PUBSUB_CHANNELS } from '../events/channels.js';
import noteHandlers from './note.handlers.js';
import presenceHandlers from './presence.handlers.js';

const activeUsers = new Map();

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      socket.user = { id: decoded.sub, email: decoded.email, name: decoded.name };
      next();
    } catch (error) {
      logger.warn('Socket authentication failed', { error: error.message });
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info('Socket connected', { userId, socketId: socket.id });

    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId).add(socket.id);

    noteHandlers(io, socket, activeUsers);
    presenceHandlers(io, socket, activeUsers);

    socket.on('disconnect', () => {
      const userSockets = activeUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) activeUsers.delete(userId);
      }
      logger.info('Socket disconnected', { userId, socketId: socket.id });
    });
  });

  setupRedisSubscriber(io);

  return io;
};

const setupRedisSubscriber = (io) => {
  redisSub.subscribe(PUBSUB_CHANNELS.SOCKET_BROADCAST, PUBSUB_CHANNELS.NOTIFICATION);

  redisSub.on('message', (channel, message) => {
    try {
      const payload = JSON.parse(message);

      if (channel === PUBSUB_CHANNELS.SOCKET_BROADCAST) {
        const { event, data } = payload;
        const room = data.team_id ? `team:${data.team_id}` : data.id ? `note:${data.id}` : null;
        if (room) {
          io.to(room).emit(event, data);
        } else {
          io.emit(event, data);
        }
      }

      if (channel === PUBSUB_CHANNELS.NOTIFICATION) {
        const { userId, notification } = payload;
        io.to(`user:${userId}`).emit('notification:new', notification);
      }
    } catch (error) {
      logger.error('Redis pub/sub message error', { error: error.message });
    }
  });
};

export { activeUsers };
