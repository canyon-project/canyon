const zlib = require('node:zlib');

function compress(jsonstring) {


  const originalSize = Buffer.byteLength(jsonstring, 'utf8');


  const gzip = zlib.gzipSync(jsonstring, { level: 9 });
  const compressedSize = gzip.length;


  const base64 = gzip.toString('base64');
  const base64Size = Buffer.byteLength(base64, 'utf8');

  // 计算压缩率
  const compressionRatio = (
    ((originalSize - compressedSize) / originalSize) *
    100
  ).toFixed(2);
  const base64Ratio = (
    ((originalSize - base64Size) / originalSize) *
    100
  ).toFixed(2);



  return base64;
}

module.exports = {
  compress,
};
