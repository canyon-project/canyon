import { request } from './request';

/**
 * 获取所有 Bu 选项
 */
export function getBu() {
  return request.get<string[]>('/api/repos/bu').then((res) => res.data);
}

export type ReposQuery = { bu?: string; search?: string };

/**
 * 获取仓库列表
 */
export function getRepos(params?: ReposQuery) {
  return request.get('/api/repos', { params }).then((res) => res.data);
}

/**
 * 获取仓库详情
 * @param repoId repoID（短）或 pathWithNamespace（org/repo）
 */
export function getRepo(repoId: string) {
  return request.get(`/api/repos/${encodeURIComponent(repoId)}`).then((res) => {
    const data = res.data;
    return {
      data: {
        ...data,
        id: data.id?.split('-').pop() ?? '',
      },
    };
  });
}

/**
 * 检查仓库（拉取 repoID、pathWithNamespace、描述）
 */
export function checkRepo(repoID: string, provider: string) {
  return request
    .get<{ repoID: string; pathWithNamespace: string; description: string }>(
      '/api/repos/check',
      { params: { repoID, provider } },
    )
    .then((res) => res.data);
}

/**
 * 创建仓库
 */
export function createRepo(data: { repoID: string; provider: string }) {
  return request.post('/api/repos', data).then((res) => res.data);
}

/**
 * 更新仓库
 * @param repoId repoID（短）或 pathWithNamespace
 */
export function updateRepo(
  repoId: string,
  data: { bu?: string; description?: string; config?: string },
) {
  return request.patch(`/api/repos/${encodeURIComponent(repoId)}`, data);
}

/**
 * 删除仓库
 * @param repoId repoID（短）
 */
export function deleteRepo(repoId: string) {
  return request.delete(`/api/repos/${encodeURIComponent(repoId)}`);
}
