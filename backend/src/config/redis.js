import Redis from 'ioredis';
import config from './index.js';
import logger from './logger.js';

// config is loaded before this module via index.js dotenv

const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

const redisPub = new Redis(config.redis.url, { lazyConnect: true });
const redisSub = new Redis(config.redis.url, { lazyConnect: true });

redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
redisPub.on('error', (err) => logger.error('Redis pub error', { error: err.message }));
redisSub.on('error', (err) => logger.error('Redis sub error', { error: err.message }));

export const connectRedis = async () => {
  try {
    await Promise.all([redis.connect(), redisPub.connect(), redisSub.connect()]);
    logger.info('Redis connected');
  } catch (error) {
    if (config.env === 'development') {
      logger.warn('Redis unavailable — running without cache/pub-sub (start Redis for full features)', {
        error: error.message,
      });
      return;
    }
    throw error;
  }
};

export const healthCheckRedis = async () => {
  const pong = await redis.ping();
  return pong === 'PONG';
};

export { redisPub, redisSub };
export default redis;
