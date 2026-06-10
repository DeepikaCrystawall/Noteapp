import redis from '../config/redis.js';
import config from '../config/index.js';
import logger from '../config/logger.js';

const DEFAULT_TTL = config.cache.ttl;

export const cacheGet = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.warn('Cache get failed', { key, error: error.message });
    return null;
  }
};

export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.warn('Cache set failed', { key, error: error.message });
  }
};

export const cacheDelete = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.warn('Cache delete failed', { key, error: error.message });
  }
};

export const cacheDeletePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.warn('Cache delete pattern failed', { pattern, error: error.message });
  }
};

export const cacheAside = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;

  const data = await fetchFn();
  if (data !== null && data !== undefined) {
    await cacheSet(key, data, ttl);
  }
  return data;
};

export const CACHE_KEYS = {
  notes: (userId, query) => `notes:${userId}:${JSON.stringify(query)}`,
  note: (noteId, userId) => `note:${noteId}:user:${userId}`,
  notifications: (userId) => `notifications:${userId}`,
  unreadCount: (userId) => `notifications:unread:${userId}`,
};
