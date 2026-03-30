import { getProviderInfra } from "@/api/lib/scm.ts";

const GITHUB_BASE = "https://github.com";

/**
 * 根据 provider、pathWithNamespace、sha 构建 SCM 的 commit 页面 URL
 * GitLab: 从 infra 按 provider 拼接键读取 BASE_URL（如 GITLAB_TUJIA_BASE_URL）
 * GitHub: 有 BASE_URL 则用，否则固定 https://github.com
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

  if (p === "gitlab" || p.startsWith("gitlab_")) {
    const { base } = getProviderInfra(provider);
    const urlBase = base?.replace(/\/$/, "") || "";
    if (!urlBase) return null;
    return `${urlBase}/${path}/-/commit/${sha}`;
  }

  if (p === "github" || p.startsWith("github_")) {
    const { base } = getProviderInfra(provider);
    const urlBase = base?.replace(/\/$/, "") || GITHUB_BASE;
    return `${urlBase}/${path}/commit/${sha}`;
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

  if (p === "gitlab" || p.startsWith("gitlab_")) {
    const { base } = getProviderInfra(provider);
    const urlBase = base?.replace(/\/$/, "") || "";
    if (!urlBase) return null;
    return `${urlBase}/${path}`;
  }

  if (p === "github" || p.startsWith("github_")) {
    const { base } = getProviderInfra(provider);
    const urlBase = base?.replace(/\/$/, "") || GITHUB_BASE;
    return `${urlBase}/${path}`;
  }

  return null;
}

/**
 * 根据 provider、pathWithNamespace、fromSha、toSha 构建 SCM 的 compare 页面 URL
 */
export function buildCompareUrl(
  provider: string,
  pathWithNamespace: string,
  fromSha: string,
  toSha: string,
): string | null {
  if (!pathWithNamespace || !fromSha || !toSha) return null;

  const p = provider?.toLowerCase() ?? "";
  const path = pathWithNamespace.trim();
  if (!path) return null;

  if (p === "gitlab" || p.startsWith("gitlab_")) {
    const { base } = getProviderInfra(provider);
    const urlBase = base?.replace(/\/$/, "") || "";
    if (!urlBase) return null;
    return `${urlBase}/${path}/-/compare/${fromSha}...${toSha}`;
  }

  if (p === "github" || p.startsWith("github_")) {
    const { base } = getProviderInfra(provider);
    const urlBase = base?.replace(/\/$/, "") || GITHUB_BASE;
    return `${urlBase}/${path}/compare/${fromSha}...${toSha}`;
  }

  return null;
}
