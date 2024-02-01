import { compress, decompress } from '@mongodb-js/zstd';

export async function compressedData(str) {
  const buffer = Buffer.from(str);
  const compressed = await compress(buffer);
  return compressed.toString('base64');
}

export async function decompressedData(str) {
  const decompressed = await decompress(Buffer.from(str, 'base64'));
  return Buffer.from(decompressed).toString();
}
