import { request } from './request';

export type SnapshotFormValues = {
  repoID: string;
  provider: string;
  sha: string;
  title?: string;
  description?: string;
};

export type SnapshotRecord = {
  id: string;
  repoID: string;
  provider: string;
  sha: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt?: string;
};

/**
 * 快照记录列表
 */
export function getSnapshotRecords(repoID: string, provider: string) {
  return request
    .get<{ data: SnapshotRecord[] }>('/api/snapshot/records', {
      params: { repoID, provider },
    })
    .then((res) => res.data.data ?? []);
}

/**
 * 创建快照
 */
export function createSnapshot(data: SnapshotFormValues) {
  return request.post('/api/snapshot/create', data);
}

/**
 * 获取单条快照（不含产物）
 */
export function getSnapshot(id: string) {
  return request.get(`/api/snapshot/${id}`).then((res) => res.data);
}

/**
 * 更新快照
 */
export function updateSnapshot(
  id: string,
  data: { title?: string; description?: string; status?: string },
) {
  return request.patch(`/api/snapshot/${id}`, data);
}

/**
 * 删除快照
 */
export function deleteSnapshot(id: string) {
  return request.delete(`/api/snapshot/${id}`);
}

/**
 * 下载快照产物，返回 Blob
 */
export function downloadSnapshot(id: string): Promise<Blob> {
  return request
    .get(`/api/snapshot/${id}/download`, { responseType: 'blob' })
    .then((res) => res.data as Blob);
}
