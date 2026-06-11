import Redis from 'ioredis';
import config from './index.js';
import logger from './logger.js';

const redisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy: () => null,
};

const noopRedis = {
  get: async () => null,
  set: async () => 'OK',
  setex: async () => 'OK',
  del: async () => 0,
  keys: async () => [],
  incr: async () => 1,
  decr: async () => 0,
  ping: async () => 'PONG',
  call: async () => null,
  connect: async () => {},
  disconnect: () => {},
  subscribe: () => {},
  on: () => {},
  removeAllListeners: () => {},
  publish: async () => 0,
};

let redisConnected = false;
let redis = noopRedis;
let redisPub = noopRedis;
let redisSub = noopRedis;

const createClients = () => {
  redis = new Redis(config.redis.url, redisOptions);
  redisPub = new Redis(config.redis.url, redisOptions);
  redisSub = new Redis(config.redis.url, redisOptions);
};

const attachErrorHandlers = () => {
  const onError = (label) => (err) => {
    if (!redisConnected) return;
    logger.error(`Redis ${label} error`, { error: err.message || String(err) });
  };
  redis.on('error', onError(''));
  redisPub.on('error', onError('pub'));
  redisSub.on('error', onError('sub'));
};

const disableRedis = () => {
  redisConnected = false;
  for (const client of [redis, redisPub, redisSub]) {
    if (client !== noopRedis) {
      client.removeAllListeners('error');
      client.disconnect(false);
    }
  }
  redis = noopRedis;
  redisPub = noopRedis;
  redisSub = noopRedis;
};

export const isRedisReady = () => redisConnected;

export const connectRedis = async () => {
  if (!config.redis.enabled) {
    logger.info('Redis disabled (REDIS_ENABLED=false)');
    return;
  }

  if (redis === noopRedis) {
    createClients();
  }

  try {
    await Promise.all([redis.connect(), redisPub.connect(), redisSub.connect()]);
    redisConnected = true;
    attachErrorHandlers();
    logger.info('Redis connected');
  } catch (error) {
    disableRedis();
    if (config.env === 'development') {
      logger.warn('Redis unavailable — running without cache/pub-sub', { error: error.message });
      return;
    }
    throw error;
  }
};

export const healthCheckRedis = async () => {
  if (!config.redis.enabled || !redisConnected) return false;
  const pong = await redis.ping();
  return pong === 'PONG';
};

export { redisPub, redisSub };
export default redis;
