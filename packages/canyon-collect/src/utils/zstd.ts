import * as zlib from 'node:zlib';

// 输入是一个对象，输出是一个 Buffer
export async function compressedData(input: object) {
  const options = {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // 设置压缩质量
    },
  };
  return zlib.brotliCompressSync(JSON.stringify(input), options);
}

// 输入是一个 Buffer，输出是一个对象
export async function decompressedData(
  compressedData: Buffer,
): Promise<object> {
  if (!compressedData||compressedData.length===0) {
    return {};
  }
  // console.log(compressedData.length,'compressedData')
  const decompressed = zlib.brotliDecompressSync(compressedData);
  return JSON.parse(decompressed.toString());
}
