import * as zlib from 'node:zlib';

/**
 * 将 base64 字符串转换为 Buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

/**
 * 解压 gzip 压缩的数据
 */
export function decompressGzip(compressedBuffer: Buffer): string {
  const decompressedBuffer = zlib.gunzipSync(compressedBuffer);
  return decompressedBuffer.toString('utf-8');
}

/**
 * 从 base64 字符串解压并解析 JSON
 */
export function decompressAndParse(base64: string): any {
  const buffer = base64ToBuffer(base64);
  const decompressed = decompressGzip(buffer);
  return JSON.parse(decompressed);
}
