import { computeHash } from './hash';

/**
 * Location 位置信息接口
 */
interface Location {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

/**
 * StatementMap 条目接口
 */
interface StatementMapEntry {
  start: Location['start'];
  end: Location['end'];
  contentHash?: string;
}

/**
 * 根据位置信息从源码中提取代码片段
 *
 * @param sourceCode - 源代码内容
 * @param start - 起始位置
 * @param end - 结束位置
 * @returns 提取的代码片段
 */
function extractCodeSnippet(
  sourceCode: string,
  start: Location['start'],
  end: Location['end'],
): string {
  const lines = sourceCode.split('\n');

  // 行号从 1 开始，数组索引从 0 开始
  const startLineIndex = start.line - 1;
  const endLineIndex = end.line - 1;

  if (startLineIndex < 0 || endLineIndex >= lines.length) {
    return '';
  }

  // 如果是同一行
  if (startLineIndex === endLineIndex) {
    const line = lines[startLineIndex];
    if (!line) {
      return '';
    }
    return line.slice(start.column, end.column);
  }

  // 跨多行的情况
  const startLine = lines[startLineIndex];
  const endLine = lines[endLineIndex];
  if (!startLine || !endLine) {
    return '';
  }

  const firstLinePart = startLine.slice(start.column);
  const middleLines = lines.slice(startLineIndex + 1, endLineIndex);
  const lastLinePart = endLine.slice(0, end.column);

  return [firstLinePart, ...middleLines, lastLinePart].join('\n');
}

/**
 * 为 statementMap 中的每个条目添加 contentHash 字段
 * 基于位置信息提取源码片段并计算 hash
 *
 * @param statementMap - StatementMap 对象
 * @param sourceCode - 源代码内容
 */
export function enrichStatementMapWithHash(
  statementMap: Record<string, StatementMapEntry>,
  sourceCode: string,
): void {
  if (!statementMap || typeof statementMap !== 'object') {
    return;
  }

  Object.keys(statementMap).forEach((key) => {
    const entry = statementMap[key];
    if (
      entry &&
      typeof entry === 'object' &&
      entry.start &&
      entry.end &&
      typeof entry.start.line === 'number' &&
      typeof entry.start.column === 'number' &&
      typeof entry.end.line === 'number' &&
      typeof entry.end.column === 'number'
    ) {
      try {
        const codeSnippet = extractCodeSnippet(
          sourceCode,
          entry.start,
          entry.end,
        );
        if (codeSnippet) {
          entry.contentHash = computeHash(codeSnippet);
        }
      } catch (_error) {
        // 忽略提取失败，保持现有行为
      }
    }
  });
}
