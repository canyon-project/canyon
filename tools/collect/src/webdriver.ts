/**
 * 是否为 WebDriver 控制的浏览器会话（常见 UI 自动化：Selenium、部分 Playwright/Chromium 配置等）。
 * 此类环境不执行覆盖率采集，避免干扰自动化与无效上报。
 */
export function isWebDriverBrowser(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}
