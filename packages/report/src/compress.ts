import { gzipSync } from 'node:zlib';

export function compress(jsonstring: string): string {
  const gzip = gzipSync(jsonstring, { level: 9 });
  const base64 = gzip.toString('base64');
  return base64;
}
