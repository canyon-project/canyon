import * as zlib from 'node:zlib';

export const transformCoverageStatementContentToCk = (statementMap) => {
  return Object.fromEntries(
    Object.entries(statementMap).map(([k, v]) => [
      Number(k),
      // @ts-expect-error
      v.contentHash,
    ]),
  );
};

export function decodeCompressedObject(compressedBuffer) {
  try {
    // 解压缩
    const decompressedBuffer = zlib.gunzipSync(compressedBuffer);
    // 将解压缩后的 Buffer 转换为字符串
    const jsonString = decompressedBuffer.toString();
    // 解析字符串为 JavaScript 对象
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('解码过程中出现错误:', error);
    return null;
  }
}

export function encodeObjectToCompressedBuffer(object) {
  // 将对象转换为字符串
  const jsonString = JSON.stringify(object);
  // 将字符串转换为 Buffer
  const buffer = Buffer.from(jsonString, 'utf-8');
  // 压缩 Buffer
  const compressedBuffer = zlib.gzipSync(buffer);
  return compressedBuffer;
}
