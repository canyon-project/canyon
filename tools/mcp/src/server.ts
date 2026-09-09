import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CanyonClient } from "./client.js";

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
        "请先调用 list_snapshots 查找对应快照，或先在 Canyon UI 创建快照，再给出：",
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
