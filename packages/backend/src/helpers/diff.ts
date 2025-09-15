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

  for (const change of changes) {
    const lineCount = (change.value.match(/\n/g) || []).length;

    if (change.added) {
      for (let i = 0; i < lineCount; i++) additions.push(newLine + i);
      newLine += lineCount;
    } else if (change.removed) {
      for (let i = 0; i < lineCount; i++) deletions.push(oldLine + i);
      oldLine += lineCount;
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
