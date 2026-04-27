import { Hono } from "hono";
import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { serveStatic } from "@hono/node-server/serve-static";
import { fileURLToPath } from "node:url";

import { loadInfra } from "@/api/lib/infra";
import { initSqliteQueue } from "@/api/lib/sqlite-queue.ts";
import { startCoverageConsumer } from "@/api/lib/collect/coverage-consumer.ts";

import reposApi from "@/api/routes/repos.ts";
import sourceApi from "@/api/routes/source.ts";
import collectApi from "@/api/routes/collect.ts";
import coverageApi from "@/api/routes/coverage.ts";
import userApi from "@/api/routes/user.ts";
import infraApi from "@/api/routes/infra.ts";
import loggerApi from "@/api/routes/logger.ts";
import { getAuth } from "@/api/lib/auth.ts"
import { historyApiFallback } from "hono-history-api-fallback";

await loadInfra();
await initSqliteQueue();
startCoverageConsumer();

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const app = new Hono();

const api = new OpenAPIHono();

api.route("/repos", reposApi);
api.route("/user", userApi);
api.route("/infra", infraApi);
api.route("/source", sourceApi);
api.route("/coverage", collectApi);
api.route("/coverage", coverageApi);
api.route("/logger", loggerApi);

api.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "API",
    description: "全栈 Web 应用 API，包含文章、仓库、源码、覆盖率等模块。",
  },
  servers: [{ url: "/api", description: "API base path" }],
});

api.get("/ui", swaggerUI({ url: "/api/doc", baseUrl: "https://unpkg.com" }));

api.get("/health", (c) => c.text("OK"));

/** 用于测试服务端请求体大小限制：POST 任意内容，返回接收到的字节数 */
api.post("/debug/body-size", async (c) => {
  const body = await c.req.arrayBuffer();
  const sizeBytes = body.byteLength;
  return c.json({
    sizeBytes,
    sizeKB: Number((sizeBytes / 1024).toFixed(2)),
    sizeMB: Number((sizeBytes / 1024 / 1024).toFixed(2)),
    contentLengthHeader: c.req.header("Content-Length") ?? null,
  });
});

app.get("/vi/health", (c) => c.text("OK"));

app.use("/api/*", cors());

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return getAuth().handler(c.req.raw);
});

app.route("/api", api);

app.use("/*", historyApiFallback({ root: __dirname }));
app.use("/*", serveStatic({ root: __dirname }));

export default app;
