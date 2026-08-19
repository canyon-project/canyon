import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { coverageRoutes } from "./routes/coverage.ts";

const app = new Hono();
const port = Number(process.env.PORT || 3000);

app.use("/api/*", cors());
app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/coverage", coverageRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, message: err instanceof Error ? err.message : String(err) }, 500);
});

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`API is running on http://localhost:${info.port}`);
  },
);
