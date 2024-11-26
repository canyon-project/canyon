import * as zlib from "node:zlib";

// 输入是一个 Buffer，输出是一个对象
export async function decompressedData(compressedData) {
  const decompressed = zlib.brotliDecompressSync(compressedData);
  return JSON.parse(decompressed.toString());
}
