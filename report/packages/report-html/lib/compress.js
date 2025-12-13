const zlib = require('node:zlib');

function compress(jsonstring) {
  const originalSize = Buffer.byteLength(jsonstring, 'utf8');
  const gzip = zlib.gzipSync(jsonstring, { level: 9 });
  const compressedSize = gzip.length;
  const base64 = gzip.toString('base64');
  const base64Size = Buffer.byteLength(base64, 'utf8');
  
  // 计算压缩率
  const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
  const base64Ratio = ((originalSize - base64Size) / originalSize * 100).toFixed(2);
  
  console.log(`压缩统计:
  原始大小: ${(originalSize / 1024).toFixed(2)} KB
  Gzip压缩后: ${(compressedSize / 1024).toFixed(2)} KB (压缩率: ${compressionRatio}%)
  Base64编码后: ${(base64Size / 1024).toFixed(2)} KB (总体压缩率: ${base64Ratio}%)`);
  
  return base64;
}


module.exports = {
  compress
}
