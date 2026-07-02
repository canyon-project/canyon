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
