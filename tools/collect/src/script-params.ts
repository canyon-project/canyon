import { getGlobal } from "./global.js";

/**
 * 从当前正在执行的 `<script src="...?dsn=...">` 解析查询参数并写入全局。
 * 仅在同步执行的独立脚本（如 IIFE 入口）中调用；`document.currentScript` 在 async/defer 下常为 null。
 * 已有 `CANYON_DSN` / `CANYON_SCENE` 时不覆盖。
 */
export function applyCollectParamsFromCurrentScript(): void {
  if (typeof document === "undefined") {
    return;
  }
  const el = document.currentScript as HTMLScriptElement | null;
  if (!el?.src) {
    return;
  }
  let url: URL;
  try {
    url = new URL(el.src, typeof location !== "undefined" ? location.href : undefined);
  } catch {
    return;
  }
  const g = getGlobal();
  const dsn = url.searchParams.get("dsn");
  if (dsn && g.CANYON_DSN === undefined) {
    g.CANYON_DSN = dsn;
  }
  const sceneRaw = url.searchParams.get("scene");
  if (sceneRaw && g.CANYON_SCENE === undefined) {
    try {
      g.CANYON_SCENE = JSON.parse(decodeURIComponent(sceneRaw)) as Record<string, unknown>;
    } catch {
      // 忽略非法 JSON，避免打断采集安装
    }
  }
}
