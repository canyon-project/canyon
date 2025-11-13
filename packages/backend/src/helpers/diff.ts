import { diffLines } from 'diff';

export function computeJSDiffLines(
  oldContent: string,
  newContent: string,
): {
  additions: number[];
  deletions: number[];
} {
  const additions: number[] = [];
  const deletions: number[] = [];

  if (!oldContent && !newContent) return { additions, deletions };

  const changes = diffLines(oldContent || '', newContent || '');
  let oldLine = 1;
  let newLine = 1;

  const isIgnorable = (line: string): boolean => {
    const trimmed = line.trim();
    if (trimmed === '') return true; // 空行
    if (trimmed.startsWith('//')) return true; // 单行注释（含 /// 指令）

    // 单行块注释，如: /* comment */
    if (/^\/\*.*\*\/$/.test(trimmed)) return true;

    // JSDoc 内部行，如: * desc 或  * @param
    if (/^\*(\s|@|$)/.test(trimmed)) return true;

    // 纯开始或纯结束的块注释行（无其它代码）
    if (trimmed.startsWith('/*') && !trimmed.includes('*/')) return true;
    if (trimmed.endsWith('*/') && !trimmed.includes('/*')) return true;

    // JSX 注释占位：{/* comment */}
    if (/^\{\s*\/\*.*\*\/\s*\}$/.test(trimmed)) return true;
    if (trimmed.startsWith('{/*') && !trimmed.includes('*/}')) return true;
    if (trimmed.endsWith('*/}') && !trimmed.includes('{/*')) return true;

    return false;
  };

  for (const change of changes) {
    const rawLines = change.value.split('\n');
    const lineCount = rawLines.length - 1; // 与 diffLines 的换行计数保持一致

    if (change.added) {
      for (let i = 0; i < lineCount; i++) {
        const lineStr = rawLines[i] ?? '';
        if (!isIgnorable(lineStr)) additions.push(newLine);
        newLine += 1;
      }
    } else if (change.removed) {
      for (let i = 0; i < lineCount; i++) {
        const lineStr = rawLines[i] ?? '';
        if (!isIgnorable(lineStr)) deletions.push(oldLine);
        oldLine += 1;
      }
    } else {
      oldLine += lineCount;
      newLine += lineCount;
    }
  }

  return { additions, deletions };
}

type ChangedFile = {
  old_path?: string;
  new_path?: string;
  new_file?: boolean;
  deleted_file?: boolean;
};

export function filterChangedFilesForJsTs(
  files: ChangedFile[],
  filepath?: string | null,
): ChangedFile[] {
  const isJsTsFile = (filePath?: string): boolean => {
    if (!filePath) return false;
    const ext = filePath.toLowerCase().split('.').pop();
    return ['js', 'jsx', 'ts', 'tsx'].includes(ext || '');
  };
  const matchesFilepath = (filePath?: string): boolean => {
    if (!filepath || !filePath) return true;
    return filePath.includes(filepath);
  };
  return (files || []).filter((file) => {
    const isJsTs = isJsTsFile(file.new_path) || isJsTsFile(file.old_path);
    const matchesPath =
      matchesFilepath(file.new_path) || matchesFilepath(file.old_path);
    return isJsTs && matchesPath;
  });
}
