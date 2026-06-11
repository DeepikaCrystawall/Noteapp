/** Parse comma-separated CORS_ORIGIN env into a list of allowed origins. */
export function parseCorsOrigins(value) {
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

/** Express `cors` origin callback — supports multiple origins with credentials. */
export function createCorsOriginCallback(allowedOrigins) {
  return (origin, callback) => {
    // Non-browser clients (curl, health checks) may omit Origin
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  };
}
