import { z } from "@hono/zod-openapi";

/**
 * Provider 命名规范：gitlab、github 或带后缀如 gitlab_tujia、github_enterprise
 */
const PROVIDER_PATTERN = /^(gitlab|github)(_[a-zA-Z0-9_]+)?$/;

export const ProviderSchema = z
  .string()
  .regex(PROVIDER_PATTERN, "provider 需为 gitlab、github 或带后缀如 gitlab_tujia")
  .describe("SCM 提供商，支持 gitlab、github 及扩展如 gitlab_tujia");

export const ProviderQueryParam = ProviderSchema.openapi({
  param: { name: "provider", in: "query" },
});
