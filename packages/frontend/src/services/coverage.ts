import { request } from './request';

export type CommitsQuery = {
  repoID: string;
  page?: number;
  pageSize?: number;
  search?: string;
  defaultBranch?: string;
};

/**
 * 获取提交列表（覆盖率 commits）
 */
export function getCommits(params: CommitsQuery) {
  return request
    .get<{ data: unknown[] }>('/api/coverage/commits', { params })
    .then((res) => res.data?.data ?? []);
}
