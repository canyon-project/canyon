import { request } from "./request";

export type ReposQuery = { search?: string };
export type RepoMemberRole = "admin" | "developer";

export type RepoMember = {
  id: string;
  repoID: string;
  provider: string;
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
export function getRepo(repoId: string, provider: string) {
  return request
    .get(`/api/repos/${encodeURIComponent(repoId)}`, { params: { provider } })
    .then((res) => {
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
  provider: string,
  data: { description?: string; config?: string },
) {
  return request.put(`/api/repos/${encodeURIComponent(repoId)}`, data, { params: { provider } });
}

/**
 * 删除仓库
 * @param repoId repoID（短）
 */
export function deleteRepo(repoId: string, provider: string) {
  return request.delete(`/api/repos/${encodeURIComponent(repoId)}`, { params: { provider } });
}

export function getRepoMembers(repoId: string, provider: string) {
  return request
    .get<RepoMember[]>(`/api/repos/${encodeURIComponent(repoId)}/members`, { params: { provider } })
    .then((res) => res.data);
}

export function searchRepoMemberCandidates(
  repoId: string,
  provider: string,
  params?: { keyword?: string; limit?: number },
) {
  return request
    .get<MemberCandidateUser[]>(`/api/repos/${encodeURIComponent(repoId)}/member-candidates`, {
      params: { ...params, provider },
    })
    .then((res) => res.data);
}

export function createRepoMember(
  repoId: string,
  provider: string,
  data: { userID: string; role: RepoMemberRole },
) {
  return request
    .post<RepoMember>(`/api/repos/${encodeURIComponent(repoId)}/members`, data, { params: { provider } })
    .then((res) => res.data);
}

export function updateRepoMember(
  repoId: string,
  provider: string,
  memberId: string,
  data: { userID?: string; role?: RepoMemberRole },
) {
  return request
    .put<RepoMember>(`/api/repos/${encodeURIComponent(repoId)}/members/${memberId}`, data, {
      params: { provider },
    })
    .then((res) => res.data);
}

export function deleteRepoMember(repoId: string, provider: string, memberId: string) {
  return request.delete(`/api/repos/${encodeURIComponent(repoId)}/members/${memberId}`, {
    params: { provider },
  });
}
