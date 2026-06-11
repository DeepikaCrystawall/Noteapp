import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseCorsOrigins } from '../utils/corsOrigins.js';
import { envBool, envInt, requireEnv } from '../utils/requireEnv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const publicUrl = requireEnv('PUBLIC_URL').replace(/\/$/, '');

const config = {
  env: requireEnv('NODE_ENV'),
  host: requireEnv('HOST'),
  port: envInt('PORT'),
  publicUrl,
  apiUrl: `${publicUrl}/api`,
  frontendUrl: requireEnv('FRONTEND_URL'),
  db: {
    host: requireEnv('DB_HOST'),
    port: envInt('DB_PORT'),
    name: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    poolMin: envInt('DB_POOL_MIN'),
    poolMax: envInt('DB_POOL_MAX'),
  },
  redis: {
    enabled: envBool('REDIS_ENABLED'),
    url: requireEnv('REDIS_URL'),
    host: requireEnv('REDIS_HOST'),
    port: envInt('REDIS_PORT'),
  },
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessExpiresIn: requireEnv('JWT_ACCESS_EXPIRES_IN'),
    refreshExpiresIn: requireEnv('JWT_REFRESH_EXPIRES_IN'),
  },
  cookie: {
    secure: envBool('COOKIE_SECURE'),
    domain: requireEnv('COOKIE_DOMAIN'),
  },
  cors: {
    origins: parseCorsOrigins(requireEnv('CORS_ORIGIN')),
  },
  rateLimit: {
    enabled: envBool('RATE_LIMIT_ENABLED'),
    windowMs: envInt('RATE_LIMIT_WINDOW_MS'),
    max: envInt('RATE_LIMIT_MAX'),
    authWindowMs: envInt('RATE_LIMIT_AUTH_WINDOW_MS'),
    authMax: envInt('RATE_LIMIT_AUTH_MAX'),
  },
  cache: {
    ttl: envInt('CACHE_TTL'),
  },
  upload: {
    dir: requireEnv('UPLOAD_DIR'),
    maxFileSize: envInt('MAX_FILE_SIZE'),
  },
};

export default config;
