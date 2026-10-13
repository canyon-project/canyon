import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { collectRoutes } from "./routes/collect.js";

/** 管理台构建产物目录（apps/app build → services/api/public） */
const publicRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public");

export function createApp() {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  // CI / 直连仍走 /coverage/*；管理台 fetch 默认 /api/*
  app.route("/", collectRoutes);
  app.route("/api", collectRoutes);

  if (existsSync(publicRoot)) {
    app.use("*", serveStatic({ root: publicRoot }));
    app.use("*", serveStatic({ root: publicRoot, path: "index.html" }));
  }

  return app;
}
