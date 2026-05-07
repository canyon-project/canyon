import { createScmAdapter } from "@/api/scm/index.ts";
import { getInfra } from "@/api/lib/infra.ts";
import type { ScmAdapter } from "@/api/scm/adapter.ts";
import { createScmAdapter as newCreateScmAdapter} from "@canyonjs/git-provider";
import type { ScmAdapter as NewScmAdapter } from "@canyonjs/git-provider";

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

export function getScm(provider: string): ScmAdapter | null {
  const p = provider.toLowerCase();
  if (p === "gitlab" || p.startsWith("gitlab_")) {
    const { base, token } = getProviderInfra(provider);
    if (!base || !token || token === "-") return null;
    return createScmAdapter({ type: "gitlab", base, token });
  }
  if (p === "github" || p.startsWith("github_")) {
    const { token } = getProviderInfra(provider);
    if (!token || token === "-") return null;
    return createScmAdapter({ type: "github", token });
  }
  return null;
}


export function getNewScm(provider: string): NewScmAdapter | null {
  const p = provider.toLowerCase();
  if (p === "gitlab" || p.startsWith("gitlab_")) {
    const { base, token } = getProviderInfra(provider);
    if (!base || !token || token === "-") return null;
    return newCreateScmAdapter({ type: "gitlab", base, token });
  }
  if (p === "github" || p.startsWith("github_")) {
    const { token } = getProviderInfra(provider);
    if (!token || token === "-") return null;
    return newCreateScmAdapter({ type: "github", token });
  }
  return null;
}
