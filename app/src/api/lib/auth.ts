import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "./prisma";
import { getInfra, getInfraOrThrow, InfraKey } from "./infra";

function createAuthInstance() {
  const gitlabClientId = getInfra(InfraKey.GITLAB_CLIENT_ID);
  const gitlabClientSecret = getInfra(InfraKey.GITLAB_CLIENT_SECRET);
  const gitlabBaseUrl = getInfra(InfraKey.GITLAB_BASE_URL);
  const gitlabIssuer = gitlabBaseUrl?.replace(/\/+$/, "");

  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    baseURL: getInfra(InfraKey.BETTER_AUTH_URL) ?? "http://localhost:3000",
    secret: getInfraOrThrow(InfraKey.BETTER_AUTH_SECRET),
    trustedOrigins: [getInfra(InfraKey.BETTER_AUTH_TRUSTED_ORIGIN) ?? "http://localhost:3000"],
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
    },
    socialProviders:
      gitlabClientId && gitlabClientSecret
        ? {
            gitlab: {
              clientId: gitlabClientId,
              clientSecret: gitlabClientSecret,
              ...(gitlabIssuer ? { issuer: gitlabIssuer } : {}),
            },
          }
        : {},
  });
}

type AuthInstance = ReturnType<typeof createAuthInstance>;

let authInstance: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!authInstance) {
    authInstance = createAuthInstance();
  }

  return authInstance;
}

