import { expect, test } from "@playwright/test";

test("待办页可加载并添加一条任务", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "待办" })).toBeVisible();

  const input = page.getByPlaceholder("今天要做什么？");
  await input.fill("e2e 测试任务");
  await input.press("Enter");

  await expect(page.getByText("e2e 测试任务")).toBeVisible();
});
