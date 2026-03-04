import { getInfra, InfraKey } from "@/api/lib/infra.ts";

const GITHUB_BASE = "https://github.com";

/**
 * 根据 provider、pathWithNamespace、sha 构建 SCM 的 commit 页面 URL
 * GitLab: 从 infra 读取 GITLAB_BASE_URL
 * GitHub: 固定 https://github.com
 */
export function buildCommitUrl(
  provider: string,
  pathWithNamespace: string,
  sha: string,
): string | null {
  if (!pathWithNamespace || !sha) return null;

  const p = provider?.toLowerCase() ?? "";
  const path = pathWithNamespace.trim();
  if (!path) return null;

  if (p === "gitlab") {
    const base = getInfra(InfraKey.GITLAB_BASE_URL)?.replace(/\/$/, "") || "";
    if (!base) return null;
    return `${base}/${path}/-/commit/${sha}`;
  }

  if (p === "github") {
    return `${GITHUB_BASE}/${path}/commit/${sha}`;
  }

  return null;
}

/**
 * 根据 provider、pathWithNamespace 构建 SCM 的仓库页面 URL
 */
export function buildRepoUrl(provider: string, pathWithNamespace: string): string | null {
  if (!pathWithNamespace) return null;

  const p = provider?.toLowerCase() ?? "";
  const path = pathWithNamespace.trim();
  if (!path) return null;

  if (p === "gitlab") {
    const base = getInfra(InfraKey.GITLAB_BASE_URL)?.replace(/\/$/, "") || "";
    if (!base) return null;
    return `${base}/${path}`;
  }

  if (p === "github") {
    return `${GITHUB_BASE}/${path}`;
  }

  return null;
}
