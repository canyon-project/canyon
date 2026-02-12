import { request } from './request';

export type DiffListQuery = {
  repoID: string;
  provider: string;
};

export type DiffCreateBody = {
  repoID: string;
  provider: string;
  subject: string;
  subjectID: string;
};

/**
 * 获取 diff 列表（累积记录等）
 */
export function getDiffList(params: DiffListQuery) {
  return request
    .get<{ data: unknown[]; total?: number }>('/api/code/diff', { params })
    .then((res) => res.data);
}

/**
 * 创建 diff（如新增累积记录）
 */
export function createDiff(body: DiffCreateBody) {
  return request.post('/api/code/diff', body);
}

/**
 * 删除 diff
 */
export function deleteDiff(params: DiffListQuery & { subjectID: string; subject: string }) {
  return request.delete('/api/code/diff', { params });
}
