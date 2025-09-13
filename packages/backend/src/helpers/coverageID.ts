export function encodeID(data) {
  const json = JSON.stringify(data); // 正确编码中文
  return Buffer.from(json, 'utf8').toString('base64url'); // Node v14.18+ 支持 base64url
}

export function decodeID(encoded) {
  const json = Buffer.from(encoded, 'base64url').toString('utf8');
  return JSON.parse(json);
}
