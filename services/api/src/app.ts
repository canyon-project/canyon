import { Hono } from "hono";
import { cors } from "hono/cors";

import { collectRoutes } from "./routes/collect.js";

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

  app.get("/", (c) => {
    return c.text("Hello Hono!");
  });

  app.route("/", collectRoutes);

  return app;
}
