import { useRequest } from 'ahooks';

/**
 * 根据 org 和 repo 获取 repoID
 */
export const useRepoID = (org: string, repo: string) => {
  const { data: repoData } = useRequest(
    async () => {
      const repoId = `${org}/${repo}`;
      const resp = await fetch(`/api/repos/${encodeURIComponent(repoId)}`, {
        credentials: 'include',
      });
      if (resp.ok) {
        return resp.json();
      }
      return null;
    },
    { refreshDeps: [org, repo] },
  );

  return repoData?.id || '';
};
