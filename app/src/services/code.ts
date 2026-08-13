import type { DiffCreateBody, DiffListQuery } from "@/shared/schemas/source";
import { request } from "./request";

export type { DiffCreateBody, DiffListQuery };

/**
 * 获取 diff 列表（累积记录等）
 */
export function getDiffList(params: DiffListQuery) {
  return request
    .get<{ data: unknown[]; total?: number }>("/api/source/diff", { params })
    .then((res) => res.data);
}

/**
 * 创建 / 刷新 compare（支持 SHA、分支、MR）
 */
export function createDiff(body: DiffCreateBody) {
  return request.post("/api/source/diff", body);
}

/**
 * 删除 diff
 */
export function deleteDiff(params: {
  repoID: string;
  provider: string;
  subjectID: string;
  subject: string;
}) {
  return request.delete("/api/source/diff", { params });
}
