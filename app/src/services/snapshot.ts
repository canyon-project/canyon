import { request } from "./request";

export type SnapshotFormValues = {
  repoID: string;
  provider: string;
  subject: "commit" | "compare";
  subjectID: string;
  buildTarget?: string;
  title?: string;
  description?: string;
};

export type SnapshotRecord = {
  id: number;
  repoID: string;
  provider: string;
  subject: "commit" | "compare";
  subjectID: string;
  sha: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt?: string;
};

/**
 * 快照记录列表
 */
export function getSnapshotRecords(
  repoID: string,
  provider: string,
  subject?: "commit" | "compare",
) {
  return request
    .get<{ data: SnapshotRecord[]; total: number }>("/api/coverage/snapshot", {
      params: { repoID, provider, subject },
    })
    .then((res) => res.data.data ?? []);
}

/**
 * 创建快照
 */
export function createSnapshot(data: SnapshotFormValues) {
  return request.post("/api/coverage/snapshot", data);
}

/**
 * 获取单条快照（不含产物）
 */
export function getSnapshot(id: string | number) {
  return request.get(`/api/coverage/snapshot/${id}`).then((res) => res.data);
}

/**
 * 更新快照
 */
export function updateSnapshot(
  id: string | number,
  data: { title?: string; description?: string; status?: string },
) {
  return request.patch(`/api/coverage/snapshot/${id}`, data);
}

/**
 * 删除快照
 */
export function deleteSnapshot(id: string | number) {
  return request.delete(`/api/coverage/snapshot/${id}`);
}

/**
 * 下载快照产物，返回 Blob
 */
export function downloadSnapshot(id: string | number): Promise<Blob> {
  return request
    .get(`/api/coverage/snapshot/${id}/download`, { responseType: "blob" })
    .then((res) => res.data as Blob);
}
