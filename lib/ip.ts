import { createHash } from 'crypto';

// returns a salted hash of the caller's ip, or null when no ip header is
// present (local dev). the raw ip is never stored.
export function hashedIp(headers: Headers): string | null {
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip');
  if (!ip) return null;

  return createHash('sha256')
    .update(`${process.env.IP_HASH_SALT ?? ''}${ip}`)
    .digest('hex');
}
