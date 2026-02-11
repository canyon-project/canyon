/**
 * 从仓库完整 id（格式 provider-repoID，如 gitlab-126555）中取出 repoID 部分。
 * 若 id 中无 '-' 则原样返回（兼容已是短 id 的情况）。
 */
export function getRepoIDFromId(id: string | undefined | null): string {
  const s = id || '';
  const idx = s.indexOf('-');
  return idx === -1 ? s : s.slice(idx + 1);
}
