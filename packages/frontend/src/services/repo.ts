import axios from 'axios';

const withCredentials = { withCredentials: true };

/**
 * 获取仓库详情
 * @param repoId repoID（短）或 pathWithNamespace（org/repo）
 */
export function getRepo(repoId: string) {
  return axios.get(`/api/repos/${encodeURIComponent(repoId)}`, withCredentials).then(response => {

    return {
      data:{
        ...response.data,
        id: response.data.id.split('-').pop() || '',
      }
    }
  });
}

/**
 * 更新仓库
 * @param repoId repoID（短）或 pathWithNamespace
 */
export function updateRepo(
  repoId: string,
  data: { bu?: string; description?: string; config?: string },
) {
  return axios.patch(
    `/api/repos/${encodeURIComponent(repoId)}`,
    data,
    {
      ...withCredentials,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

/**
 * 删除仓库
 * @param repoId repoID（短）
 */
export function deleteRepo(repoId: string) {
  return axios.delete(`/api/repos/${encodeURIComponent(repoId)}`, withCredentials);
}
