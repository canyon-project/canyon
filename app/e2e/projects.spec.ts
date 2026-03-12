import { expect } from "@playwright/test";
import { test } from "./baseTest.ts";

test.describe("Projects 页面", () => {
  test("打开 /projects 并验证 /api/repos 接口正常", async ({ page, request }) => {
    // 1. 直接请求 /api/repos 验证接口通不通
    const apiRes = await request.get("/api/repos");
    expect(apiRes.ok()).toBeTruthy();
    const data = await apiRes.json();
    expect(Array.isArray(data)).toBeTruthy();

    // 2. 打开 projects 页面
    await page.goto("/projects");

    // 3. 验证页面加载成功（项目列表页应有创建按钮或项目标题）
    await expect(
      page.getByText(/创建项目|Create|プロジェクトを作成|项目|Projects/).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
