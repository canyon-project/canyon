import { installCollect, sendCoverage } from "./core.js";
import { getGlobal } from "./global.js";
import { applyCollectParamsFromCurrentScript } from "./script-params.js";
import { isWebDriverBrowser } from "./webdriver.js";

export { applyCollectParamsFromCurrentScript, installCollect, sendCoverage, isWebDriverBrowser };

export interface CollectInitOptions {
  dsn?: string;
  scene?: Record<string, unknown>;
}

/**
 * 写入全局对象（与 `core` 读取方式一致）后调用 `installCollect()`。
 */
export function init(options?: CollectInitOptions): void {
  const g = getGlobal();
  if (options?.dsn !== undefined) {
    g.CANYON_DSN = options.dsn;
  }
  if (options?.scene !== undefined) {
    g.CANYON_SCENE = { ...(g.CANYON_SCENE || {}), ...options.scene };
  }
  installCollect();
}
