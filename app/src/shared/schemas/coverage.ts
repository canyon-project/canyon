import { z } from "@hono/zod-openapi";

/** coverage 数据结构：Record<filePath, entry>，放宽校验避免 Zod v4 与 openapi 扩展兼容问题 */
const CoverageDataSchema = z.record(z.string(), z.any());

/** POST /api/coverage/client 请求体 */
export const CoverageClientSchema = z
  .object({
    coverage: CoverageDataSchema,
    scene: z.record(z.string(), z.any()).optional(),
  })
  .openapi("CoverageClient");

/** POST /api/coverage/map/init 请求体 */
export const CoverageMapInitSchema = z
  .object({
    sha: z
      .string()
      .regex(/^[a-f0-9]{40}$/i)
      .optional(),
    provider: z.string().optional(),
    repoID: z.string().optional(),
    instrumentCwd: z.string().optional(),
    buildTarget: z.string().optional(),
    build: z.record(z.string(), z.any()).optional(),
    coverage: CoverageDataSchema,
    diff: z.array(z.any()).optional(),
  })
  .openapi("CoverageMapInit");

/** GET /api/coverage/commits 查询参数 */
export const CoverageCommitsQuerySchema = z
  .object({
    repoID: z.string().openapi({ param: { name: "repoID", in: "query" } }),
    pathWithNamespace: z
      .string()
      .optional()
      .openapi({ param: { name: "pathWithNamespace", in: "query" } }),
    provider: z
      .string()
      .optional()
      .openapi({ param: { name: "provider", in: "query" } }),
    page: z.coerce
      .number()
      .optional()
      .default(1)
      .openapi({ param: { name: "page", in: "query" } }),
    pageSize: z.coerce
      .number()
      .optional()
      .default(10)
      .openapi({ param: { name: "pageSize", in: "query" } }),
  })
  .openapi("CoverageCommitsQuery");

/** POST /api/coverage/client 响应 */
export const CoverageClientResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string().optional(),
    idempotent: z.boolean().optional(),
    buildHash: z.string(),
    sceneKey: z.string(),
    coverageLength: z.number(),
    coverageFilesTotal: z.number().optional(),
    coverageFilesFiltered: z.number().optional(),
    provider: z.string(),
    repoID: z.string(),
    sha: z.string(),
    buildTarget: z.string().optional(),
    instrumentCwd: z.string(),
  })
  .openapi("CoverageClientResponse");

/** POST /api/coverage/map/init 响应 */
export const CoverageMapInitResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
  })
  .openapi("CoverageMapInitResponse");

export type CoverageClientInput = z.infer<typeof CoverageClientSchema>;
export type CoverageMapInitInput = z.infer<typeof CoverageMapInitSchema>;
export type CoverageClientResponse = z.infer<typeof CoverageClientResponseSchema>;
export type CoverageMapInitResponse = z.infer<typeof CoverageMapInitResponseSchema>;
