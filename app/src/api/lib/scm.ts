import { getInfra } from "@/api/lib/infra.ts";
import { createScmAdapter } from "@canyonjs/git-provider";
import type { ScmAdapter } from "@canyonjs/git-provider";

/** provider 转 infra 键前缀，如 gitlab_tujia -> GITLAB_TUJIA */
export function getProviderInfraPrefix(provider: string): string {
  return provider.toUpperCase().replace(/-/g, "_");
}

/** 获取 provider 对应的 base URL 和 token，键按 provider 大写拼接 */
export function getProviderInfra(provider: string): { base?: string; token?: string } {
  const p = provider.toLowerCase();
  const prefix = getProviderInfraPrefix(provider);
  if (p === "gitlab" || p.startsWith("gitlab_")) {
    const base = getInfra(`${prefix}_BASE_URL`);
    const token = getInfra(`${prefix}_PRIVATE_TOKEN`);
    return { base, token };
  }
  if (p === "github" || p.startsWith("github_")) {
    const token = getInfra(`${prefix}_PRIVATE_TOKEN`);
    const base = getInfra(`${prefix}_BASE_URL`);
    return { token, base };
  }
  return {};
}

export function getNewScm(provider: string): ScmAdapter | null {
  const p = provider.toLowerCase();
  if (p === "gitlab" || p.startsWith("gitlab_")) {
    const { base, token } = getProviderInfra(provider);
    if (!base || !token || token === "-") return null;
    return createScmAdapter({ type: "gitlab", base: `${base}/api/v4`, token });
  }
  if (p === "github" || p.startsWith("github_")) {
    const { token } = getProviderInfra(provider);
    if (!token || token === "-") return null;
    return createScmAdapter({ type: "github", token });
  }
  return null;
}
