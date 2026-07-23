import { randomBytes } from 'crypto';

export function generateUsername(email: string): string {
  const localPart = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
  const suffix = randomBytes(3).toString('hex');
  const maxLen = 31 - 1 - suffix.length;
  return `${localPart.substring(0, maxLen)}_${suffix}`;
}
