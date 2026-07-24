import { createHash, randomBytes } from 'crypto';
import slugify from 'slugify';

export function slugifyName(value: string): string {
  return slugify(value, { lower: true, strict: true });
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function coverUrl(coverKey?: string | null): string | null {
  if (!coverKey) return null;
  if (coverKey.startsWith('http')) return coverKey;
  const base = process.env.S3_PUBLIC_URL ?? 'http://localhost:9000';
  const bucket = process.env.S3_BUCKET_COVERS ?? 'boks-covers';
  return `${base}/${bucket}/${coverKey}`;
}

export function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}
