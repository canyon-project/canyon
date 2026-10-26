# 真实项目场景（real-project）

模拟 PR/MR test CI 中与 `@canyon/real-app` 相关的链路：

1. **插桩构建** — `pnpm --filter @canyon/real-app build` → `.canyon_output`
2. **init** — 合并 JSON → `POST /coverage/map/init`
3. **Playwright** — 打开待办页并操作 UI（本目录 `*.spec.ts`）
4. **client** — 按 e2e tag 上报 hit → `POST /coverage/client`
5. **snapshot** — 创建任务并轮询 → 断言回溯后的源码 coverage

API 侧的边角与多 tag 快照逻辑在 `e2e/api/`（Vitest）；本场景侧重 **HTTP + 浏览器** 编排。

环境变量与 API 测试相同：`TEST_DATABASE_URL` 或 `DATABASE_URL`，`SNAPSHOT_TASK_SLEEP_MS=0`（Playwright 用例内会设置）。
