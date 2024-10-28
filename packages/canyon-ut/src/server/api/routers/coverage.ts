import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const coverageRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.coverage.create({
        data: {
      //     model Coverage {
      //   id                String   @id @default(cuid())
      //   sha               String   @map("sha")
      //   branch            String
      //   projectID         String   @map("project_id")
      //   // 代码覆盖率
      //   branchesTotal     Int      @map("branches_total")
      //   branchesCovered   Int      @map("branches_covered")
      //   functionsTotal    Int      @map("functions_total")
      //   functionsCovered  Int      @map("functions_covered")
      //   linesTotal        Int      @map("lines_total")
      //   linesCovered      Int      @map("lines_covered")
      //   statementsTotal   Int      @map("statements_total")
      //   statementsCovered Int      @map("statements_covered")
      //   newlinesTotal     Int      @map("newlines_total")
      //   newlinesCovered   Int      @map("newlines_covered")
      //   summary           String //zstd+pb 必要性，提高概览页面查询速度
      //   // 代码覆盖率详情
      //   // 覆盖率实体
      //   hit               String //zstd+pb
      //   // 通用
      //   createdAt         DateTime @default(now()) @map("created_at") @db.Timestamp(3)
      //
      // @@map("ut_coverage")
      // }
      //     id: "1",
          sha: "1",
          branch: "1",
          projectID: "1",
          branchesTotal: 1,
          branchesCovered: 1,
          functionsTotal: 1,
          functionsCovered: 1,
          linesTotal: 1,
          linesCovered: 1,
          statementsTotal: 1,
          statementsCovered: 1,
          newlinesTotal: 1,
          newlinesCovered: 1,
          summary: "1",
          hit: "1",
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const coverage = await ctx.db.coverage.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return coverage ?? null;
  }),
});
