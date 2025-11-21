import crypto from 'crypto';

export type HashAlgorithm = 'sha1' | 'sha256';
export type HashDigest = 'hex' | 'base64';

export function computeHash(
  content: string,
  algorithm: HashAlgorithm = 'sha1',
  digest: HashDigest = 'hex',
): string {
  const normalized = content == null ? '' : String(content);
  return crypto.createHash(algorithm).update(normalized).digest(digest);
}
