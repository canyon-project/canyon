const zlib = require('node:zlib');
const debug = require('debug')('canyon:report-html');

function compress(jsonstring) {
  debug('Starting compression of JSON string (length: %d characters)', jsonstring.length);

  const originalSize = Buffer.byteLength(jsonstring, 'utf8');
  debug('Original data size: %d bytes (%.2f KB)', originalSize, originalSize / 1024);

  const gzip = zlib.gzipSync(jsonstring, { level: 9 });
  const compressedSize = gzip.length;
  debug('Gzip compressed size: %d bytes (%.2f KB)', compressedSize, compressedSize / 1024);

  const base64 = gzip.toString('base64');
  const base64Size = Buffer.byteLength(base64, 'utf8');
  debug('Base64 encoded size: %d bytes (%.2f KB)', base64Size, base64Size / 1024);

  // 计算压缩率
  const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
  const base64Ratio = ((originalSize - base64Size) / originalSize * 100).toFixed(2);

  debug('Compression statistics - Gzip ratio: %s%%, Overall ratio: %s%%', compressionRatio, base64Ratio);

  return base64;
}


module.exports = {
  compress
}
