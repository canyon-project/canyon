import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CanyonClient } from "./client.js";
import {
  aggregateCoverageSummary,
  topChangedFiles,
  uncoveredChangedFiles,
} from "./summary.js";

const providerRepoSchema = {
  provider: z.string().describe("Git provider，例如 gitlab 或 github"),
  repoID: z.string().describe("仓库 ID 或 path_with_namespace"),
};

function textResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function createCanyonMcpServer(client = new CanyonClient()): McpServer {
  const server = new McpServer({
    name: "canyon",
    version: "0.1.0",
  });

  server.registerTool(
    "list_repos",
    {
      description: "列出 Canyon 已接入的仓库，可按 id 或 path 搜索",
      inputSchema: {
        search: z.string().optional().describe("可选搜索关键字"),
      },
    },
    async ({ search }) => {
      const repos = await client.listRepos(search);
      return textResult(
        repos.map((repo) => ({
          id: repo.id,
          pathWithNamespace: repo.pathWithNamespace,
          description: repo.description ?? "",
        })),
      );
    },
  );

  server.registerTool(
    "get_coverage_summary",
    {
      description:
        "获取 commit / compare / MR 的覆盖率摘要。compare 时 subject=compare，subjectID 为 compare 记录 ID",
      inputSchema: {
        ...providerRepoSchema,
        subject: z
          .enum(["commit", "compare", "pull", "merge_requests"])
          .describe("覆盖率主体类型"),
        subjectID: z.string().describe("commit SHA、compare subjectID 或 MR/PR ID"),
        buildTarget: z.string().optional().describe("可选 buildTarget"),
        scene: z.string().optional().describe("可选 scene JSON 字符串"),
        topChangedLimit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .default(10)
          .describe("返回变更文件 Top N，按变更语句覆盖率从低到高排序"),
      },
    },
    async ({ provider, repoID, subject, subjectID, buildTarget, scene, topChangedLimit }) => {
      const summary = await client.getCoverageSummary({
        provider,
        repoID,
        subject,
        subjectID,
        ...(buildTarget ? { buildTarget } : {}),
        ...(scene ? { scene } : {}),
      });
      return textResult({
        provider,
        repoID,
        subject,
        subjectID,
        aggregate: aggregateCoverageSummary(summary),
        topChangedFiles: topChangedFiles(summary, topChangedLimit),
      });
    },
  );

  server.registerTool(
    "get_uncovered_in_diff",
    {
      description:
        "查看 compare / MR / 分支对比里尚未覆盖的变更语句。可传已有 subjectID，或传 baseRef/headRef/mrIid 自动创建 compare",
      inputSchema: {
        ...providerRepoSchema,
        subjectID: z.string().optional().describe("已有 compare 的 subjectID"),
        mode: z
          .enum(["commits", "commit_branch", "branches", "mr"])
          .optional()
          .describe("创建 compare 时的模式"),
        baseKind: z.enum(["sha", "branch"]).optional(),
        headKind: z.enum(["sha", "branch"]).optional(),
        baseRef: z.string().optional().describe("base commit SHA 或分支名"),
        headRef: z.string().optional().describe("head commit SHA 或分支名"),
        mrIid: z.string().optional().describe("GitLab MR / GitHub PR 的数字 ID"),
        refresh: z.boolean().optional().describe("是否强制刷新 diff"),
        buildTarget: z.string().optional(),
        scene: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional().default(20),
      },
    },
    async (args) => {
      let subjectID = args.subjectID;
      let compareMeta: Record<string, unknown> | undefined;

      if (!subjectID) {
        if (args.mrIid) {
          const created = await client.createCompare({
            provider: args.provider,
            repoID: args.repoID,
            mode: "mr",
            mrIid: args.mrIid,
            ...(args.refresh ? { refresh: args.refresh } : {}),
          });
          subjectID = created.subjectID;
          compareMeta = {
            from: created.from,
            to: created.to,
            changedFileCount: created.files.length,
          };
        } else if (args.baseRef && args.headRef) {
          const created = await client.createCompare({
            provider: args.provider,
            repoID: args.repoID,
            ...(args.mode ? { mode: args.mode } : {}),
            ...(args.baseKind ? { baseKind: args.baseKind } : {}),
            ...(args.headKind ? { headKind: args.headKind } : {}),
            baseRef: args.baseRef,
            headRef: args.headRef,
            ...(args.refresh ? { refresh: args.refresh } : {}),
          });
          subjectID = created.subjectID;
          compareMeta = {
            from: created.from,
            to: created.to,
            changedFileCount: created.files.length,
          };
        } else {
          throw new Error("请提供 subjectID，或 mrIid，或 baseRef + headRef");
        }
      } else if (args.refresh) {
        const refreshed = await client.createCompare({
          provider: args.provider,
          repoID: args.repoID,
          subjectID,
          refresh: true,
        });
        compareMeta = {
          from: refreshed.from,
          to: refreshed.to,
          changedFileCount: refreshed.files.length,
        };
      }

      const summary = await client.getCoverageSummary({
        provider: args.provider,
        repoID: args.repoID,
        subject: "compare",
        subjectID,
        ...(args.buildTarget ? { buildTarget: args.buildTarget } : {}),
        ...(args.scene ? { scene: args.scene } : {}),
      });

      const uncovered = uncoveredChangedFiles(summary, args.limit);
      return textResult({
        provider: args.provider,
        repoID: args.repoID,
        subjectID,
        compare: compareMeta,
        aggregate: aggregateCoverageSummary(summary),
        uncoveredChangedFiles: uncovered,
        fullyCovered:
          uncovered.length === 0 &&
          aggregateCoverageSummary(summary).changestatements.total > 0,
      });
    },
  );

  server.registerTool(
    "list_compares",
    {
      description: "列出仓库下的 compare / diff 记录",
      inputSchema: {
        ...providerRepoSchema,
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(50).optional().default(20),
      },
    },
    async ({ provider, repoID, page, pageSize }) => {
      const result = await client.listCompares({ provider, repoID, page, pageSize });
      return textResult({
        total: result.total,
        data: result.data.map((item) => ({
          subjectID: item.subjectID,
          subject: item.subject,
          from: item.from,
          to: item.to,
          fileCount: item.files?.length ?? 0,
          createdAt: item.createdAt,
        })),
      });
    },
  );

  server.registerTool(
    "list_snapshots",
    {
      description: "列出覆盖率快照（含变更语句覆盖率指标）",
      inputSchema: {
        provider: z.string().optional(),
        repoID: z.string().optional(),
        subject: z.enum(["commit", "compare"]).optional(),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(50).optional().default(20),
      },
    },
    async ({ provider, repoID, subject, page, pageSize }) => {
      const result = await client.listSnapshots({
        ...(provider ? { provider } : {}),
        ...(repoID ? { repoID } : {}),
        ...(subject ? { subject } : {}),
        page,
        pageSize,
      });
      return textResult({
        total: result.total,
        data: result.data.map((item) => ({
          id: item.id,
          provider: item.provider,
          repoID: item.repoID,
          subject: item.subject,
          subjectID: item.subjectID,
          status: item.status,
          title: item.title,
          statementsCovered: item.statementsCovered,
          statementsTotal: item.statementsTotal,
          changestatementsCovered: item.changestatementsCovered,
          changestatementsTotal: item.changestatementsTotal,
          createdAt: item.createdAt,
        })),
      });
    },
  );

  server.registerPrompt(
    "review_compare_coverage",
    {
      description: "生成 review compare 覆盖率的提示词模板",
      argsSchema: {
        provider: z.string(),
        repoID: z.string(),
        subjectID: z.string().optional(),
        mrIid: z.string().optional(),
      },
    },
    async ({ provider, repoID, subjectID, mrIid }) => {
      const lines = [
        "请帮我 review 这次代码变更的测试覆盖情况。",
        "",
        `仓库 provider: ${provider}`,
        `repoID: ${repoID}`,
      ];
      if (subjectID) lines.push(`compare subjectID: ${subjectID}`);
      if (mrIid) lines.push(`MR/PR IID: ${mrIid}`);
      lines.push(
        "",
        "请先调用 get_uncovered_in_diff 获取未覆盖的变更语句，再给出：",
        "1. 总体变更覆盖率",
        "2. 最需要补测的文件",
        "3. 建议补哪些测试场景",
      );
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: lines.join("\n"),
            },
          },
        ],
      };
    },
  );

  return server;
}
