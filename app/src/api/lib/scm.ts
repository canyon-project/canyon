import { createScmAdapter } from "@/api/scm/index.ts";
import { getInfra, InfraKey } from "@/api/lib/infra.ts";
import type { ScmAdapter } from "@/api/scm/adapter.ts";

export function getScm(provider: string): ScmAdapter | null {
  const p = provider.toLowerCase();
  if (p === "gitlab") {
    const base = getInfra(InfraKey.GITLAB_BASE_URL);
    const token = getInfra(InfraKey.GITLAB_PRIVATE_TOKEN);
    if (!base || !token || token === "-") return null;
    return createScmAdapter({ type: "gitlab", base, token });
  }
  if (p === "github") {
    const token = getInfra(InfraKey.GITHUB_PRIVATE_TOKEN);
    if (!token || token === "-") return null;
    return createScmAdapter({ type: "github", token });
  }
  return null;
}
