import net from 'net';

/**
 * Normalize client IP for PostgreSQL INET columns.
 * Returns null when the value is missing or not a valid IPv4/IPv6 address.
 */
export function sanitizeIp(ip) {
  if (!ip || typeof ip !== 'string') return null;

  const first = ip.split(',')[0].trim().split('%')[0].trim();
  return net.isIP(first) ? first : null;
}
