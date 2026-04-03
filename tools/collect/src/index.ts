import { installCollect, sendCoverage } from "./core.js";

export { installCollect, sendCoverage };

export interface CollectInitOptions {
  dsn?: string;
  scene?: Record<string, unknown>;
}

/**
 * 写入 `window` 后调用 `installCollect()`，便于在打包场景里像 SDK 一样配置。
 * 只依赖 `core` 的 window 读取逻辑，无第二套合并分支。
 */
export function init(options?: CollectInitOptions): void {
  const w = window as unknown as {
    CANYON_DSN?: string;
    CANYON_SCENE?: Record<string, unknown>;
  };
  if (options?.dsn !== undefined) {
    w.CANYON_DSN = options.dsn;
  }
  if (options?.scene !== undefined) {
    w.CANYON_SCENE = { ...(w.CANYON_SCENE || {}), ...options.scene };
  }
  installCollect();
}
