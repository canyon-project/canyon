import os from "node:os";
import { createRoute, z } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";

const runtimeGetRoute = createRoute({
  method: "get",
  path: "/runtime",
  summary: "服务端运行环境",
  description: "返回服务端操作系统与 Node.js 版本，用于「关于」等展示。",
  tags: ["关于"],
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            operatingSystem: z.string(),
            nodeVersion: z.string(),
          }),
        },
      },
      description: "运行环境信息",
    },
  },
});

const aboutApi = new OpenAPIHono();

aboutApi.openapi(runtimeGetRoute, async (c) => {
  const operatingSystem = `${os.type()} ${os.release()} (${os.arch()}) · ${process.platform}`;
  const nodeVersion = process.version;
  return c.json({ operatingSystem, nodeVersion });
});

export default aboutApi;
