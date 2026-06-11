export function requireEnv(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Copy backend/.env.example to backend/.env and set all values.`
    );
  }
  return value;
}

export function envInt(key) {
  const value = requireEnv(key);
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be an integer, got: ${value}`);
  }
  return parsed;
}

export function envBool(key) {
  const value = requireEnv(key);
  if (value !== 'true' && value !== 'false') {
    throw new Error(`Environment variable ${key} must be "true" or "false", got: ${value}`);
  }
  return value === 'true';
}
