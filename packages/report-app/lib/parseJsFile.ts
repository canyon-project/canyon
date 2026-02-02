/**
 * 从 JS 文件内容中提取数据
 * 支持格式：
 * - window.reportData = {...}; (JSON 对象，不压缩)
 * - window.diffData = 'base64string'; (压缩的 base64 字符串)
 */
export function extractBase64FromJsFile(
  jsContent: string,
  variableName: 'reportData' | 'diffData',
): string | null {
  if (variableName === 'reportData') {
    // report-data.js 是 JSON 对象格式，不压缩
    const jsonRegex = /window\.reportData\s*=\s*({[\s\S]*?});/;
    const jsonMatch = jsContent.match(jsonRegex);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1];
    }
  } else if (variableName === 'diffData') {
    // diff-data.js 是压缩的 base64 字符串
    const regex = /window\.diffData\s*=\s*['"]([^'"]+)['"]/;
    const match = jsContent.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}
