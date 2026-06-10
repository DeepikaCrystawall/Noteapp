import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';
import config from '../config/index.js';
const createStore = (prefix) => {
  if (config.env !== 'production') {
    return undefined;
  }
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix,
  });
};

const shouldSkipRateLimit = (req) => {
  if (config.env !== 'production') return true;
  if (req.get('x-autosave') === 'true') return true;
  return false;
};

const rateLimitOptions = (windowMs, max, prefix, message) => ({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(prefix),
  message: { success: false, message, code: prefix.includes('auth') ? 'AUTH_RATE_LIMIT' : 'RATE_LIMIT_EXCEEDED' },
  skip: shouldSkipRateLimit,
});

export const apiRateLimiter = rateLimit(
  rateLimitOptions(config.rateLimit.windowMs, config.rateLimit.max, 'rl:', 'Too many requests, please try again later')
);

export const authRateLimiter = rateLimit(
  rateLimitOptions(15 * 60 * 1000, 20, 'rl:auth:', 'Too many authentication attempts')
);
