import { z } from "@hono/zod-openapi";

/** GET /api/source/diff 查询参数 */
export const DiffListQuerySchema = z
  .object({
    repoID: z.string().openapi({ param: { name: "repoID", in: "query" } }),
    provider: z.string().openapi({ param: { name: "provider", in: "query" } }),
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
  .openapi("DiffListQuery");

export type DiffListQuery = z.infer<typeof DiffListQuerySchema>;

export const CompareRefKindSchema = z.enum(["sha", "branch"]);
export const CompareCreateModeSchema = z.enum([
  "commits",
  "commit_branch",
  "branches",
  "mr",
]);

/** POST /api/source/diff 请求体。兼容旧客户端只传 subjectID=sha...sha */
export const DiffCreateBodySchema = z
  .object({
    repoID: z.string(),
    provider: z.string(),
    subject: z.string().optional().default("compare"),
    subjectID: z.string().optional(),
    mode: CompareCreateModeSchema.optional(),
    baseKind: CompareRefKindSchema.optional(),
    headKind: CompareRefKindSchema.optional(),
    baseRef: z.string().optional(),
    headRef: z.string().optional(),
    mrIid: z.string().optional(),
    refresh: z.boolean().optional(),
  })
  .openapi("DiffCreateBody");

export type DiffCreateBody = z.infer<typeof DiffCreateBodySchema>;
