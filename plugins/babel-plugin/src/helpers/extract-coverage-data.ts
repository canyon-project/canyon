/**
 * 从脚本内容中提取覆盖率数据
 * 支持两种格式：
 * 1. var coverageData = {...};
 * 2. var xxx = function() {...}();
 *
 * @param scriptContent - 包含覆盖率数据的脚本内容
 * @returns 提取的覆盖率数据对象，如果提取失败则返回 null
 */
export function extractCoverageData(
  scriptContent: string,
): Record<string, unknown> | null {
  // 匹配格式：var coverageData = {...};
  const coverageDataPattern = /var\s+coverageData\s*=\s*({[\s\S]*?});/;
  // 匹配格式：var xxx = function() {...}();
  const functionPattern =
    /var\s+(\w+)\s*=\s*function\s*\(\)\s*\{([\s\S]*?)\}\(\);/;

  try {
    // 尝试匹配第一种格式
    const coverageDataMatch = coverageDataPattern.exec(scriptContent);
    if (coverageDataMatch) {
      const objectString = coverageDataMatch[1];
      return new Function(`return ${objectString}`)() as Record<
        string,
        unknown
      >;
    }

    // 尝试匹配第二种格式
    const functionMatch = functionPattern.exec(scriptContent);
    if (functionMatch) {
      const functionBody = functionMatch[2];
      const func = new Function(`${functionBody}return coverageData;`);
      const result = func();
      return result as Record<string, unknown>;
    }
  } catch (_error) {
    // 提取失败时返回 null
    return null;
  }

  return null;
}
