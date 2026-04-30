import { request } from "./request";

export type ReposQuery = { search?: string };
export type RepoMemberRole = "admin" | "developer";

export type RepoMember = {
  id: string;
  repoID: string;
  userID: string;
  userName?: string | null;
  userEmail?: string | null;
  role: RepoMemberRole;
  createdAt: string;
  updatedAt: string;
};

export type MemberCandidateUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * 获取仓库列表
 */
export function getRepos(params?: ReposQuery) {
  return request.get("/api/repos", { params }).then((res) => res.data);
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
        id: data.id?.split("-").pop() ?? "",
      },
    };
  });
}

/**
 * 检查仓库（拉取 repoID、pathWithNamespace、描述）
 */
export function checkRepo(repoID: string, provider: string) {
  return request
    .get<{ repoID: string; pathWithNamespace: string; description: string }>("/api/repos/check", {
      params: { repoID, provider },
    })
    .then((res) => res.data);
}

/**
 * 创建仓库
 */
export function createRepo(data: { repoID: string; provider: string }) {
  return request.post("/api/repos", data).then((res) => res.data);
}

/**
 * 更新仓库
 * @param repoId repoID（短）或 pathWithNamespace
 */
export function updateRepo(
  repoId: string,
  data: { description?: string; config?: string },
) {
  return request.put(`/api/repos/${encodeURIComponent(repoId)}`, data);
}

/**
 * 删除仓库
 * @param repoId repoID（短）
 */
export function deleteRepo(repoId: string) {
  return request.delete(`/api/repos/${encodeURIComponent(repoId)}`);
}

export function getRepoMembers(repoId: string) {
  return request
    .get<RepoMember[]>(`/api/repos/${encodeURIComponent(repoId)}/members`)
    .then((res) => res.data);
}

export function searchRepoMemberCandidates(
  repoId: string,
  params?: { keyword?: string; limit?: number },
) {
  return request
    .get<MemberCandidateUser[]>(`/api/repos/${encodeURIComponent(repoId)}/member-candidates`, {
      params,
    })
    .then((res) => res.data);
}

export function createRepoMember(
  repoId: string,
  data: { userID: string; role: RepoMemberRole },
) {
  return request
    .post<RepoMember>(`/api/repos/${encodeURIComponent(repoId)}/members`, data)
    .then((res) => res.data);
}

export function updateRepoMember(
  repoId: string,
  memberId: string,
  data: { userID?: string; role?: RepoMemberRole },
) {
  return request
    .put<RepoMember>(`/api/repos/${encodeURIComponent(repoId)}/members/${memberId}`, data)
    .then((res) => res.data);
}

export function deleteRepoMember(repoId: string, memberId: string) {
  return request.delete(`/api/repos/${encodeURIComponent(repoId)}/members/${memberId}`);
}
