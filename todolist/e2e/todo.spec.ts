import { expect, test } from "./fixtures";

test("add, complete, filter and delete a todo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "待办清单" })).toBeVisible();

  await page.getByPlaceholder("今天要做什么？").fill("写覆盖率测试");
  await page.getByRole("button", { name: "添加" }).click();
  await expect(page.getByText("写覆盖率测试")).toBeVisible();
  await expect(page.locator("#todo-count")).toHaveText("1 项未完成");

  await page.locator(".toggle").check();
  await expect(page.locator("li")).toHaveClass(/done/);

  await page.getByRole("button", { name: "已完成" }).click();
  await expect(page.getByText("写覆盖率测试")).toBeVisible();

  await page.getByRole("button", { name: "未完成" }).click();
  await expect(page.getByText("还没有待办，先加一条吧。")).toBeVisible();

  await page.getByRole("button", { name: "全部" }).click();
  await page.getByRole("button", { name: "删除" }).click();
  await expect(page.getByText("还没有待办，先加一条吧。")).toBeVisible();
});
