import { createRoute, z } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";

import { logger } from "@/api/logger";

const logMessageSchema = z.object({
  type: z.enum(["info", "warn", "error", "fatal", "debug"]),
  title: z.string(),
  message: z.string(),
  addInfo: z.record(z.string(), z.unknown()).optional(),
});

const createLogRoute = createRoute({
  method: "post",
  path: "/",
  summary: "写入服务端日志",
  description: "接收日志内容并调用服务端 logger 输出",
  tags: ["日志"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: logMessageSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "日志写入成功",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
    },
  },
});

const loggerApi = new OpenAPIHono();

loggerApi.openapi(createLogRoute, async (c) => {
  const body = c.req.valid("json");
  logger(body);
  return c.json({ success: true });
});

export default loggerApi;
