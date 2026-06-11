/**
 * Frontend environment variables (Vite: must be prefixed with VITE_).
 * All values must be set in frontend/.env — see frontend/.env.example
 */
function requireViteEnv(key) {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing ${key}. Copy frontend/.env.example to frontend/.env and restart the dev server.`
    );
  }
  return value;
}

export const env = {
  apiUrl: requireViteEnv('VITE_API_URL'),
  socketUrl: requireViteEnv('VITE_SOCKET_URL'),
  assetsUrl: requireViteEnv('VITE_ASSETS_URL'),
  appName: requireViteEnv('VITE_APP_NAME'),
  isDev: import.meta.env.DEV,
};

/** Prefix relative paths from the API (e.g. /uploads/avatars/...) with the backend origin. */
export function resolveAssetUrl(path) {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${env.assetsUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
