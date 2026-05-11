// 字符串转 base64
// 匹配你解码逻辑的编码：原文 → Base64
export function encode(str:string) {
  return btoa(
    encodeURIComponent(str)
      .replace(/%([0-9A-F]{2})/gi, (_match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
  );
}
