export interface CollectInitOptions {
  /** 上报地址；不传则使用运行时的 `window.CANYON_DSN`。 */
  dsn?: string;
  /** 与 `window.CANYON_SCENE` 浅合并；同名字段以本参数为准。 */
  scene?: Record<string, unknown>;
}

let listenerAttached = false;
let configuredDsn: string | undefined;
let configuredScene: Record<string, unknown> | undefined;

const getDsn = (): string | undefined =>
  configuredDsn ?? (window as unknown as { CANYON_DSN?: string }).CANYON_DSN;

const getScene = (): Record<string, unknown> => ({
  ...((window as unknown as { CANYON_SCENE?: Record<string, unknown> }).CANYON_SCENE ??
    {}),
  ...(configuredScene ?? {}),
});

const sendCoverage = () => {
  const dsn = getDsn();
  const coverage = (window as unknown as { __coverage__?: Record<string, unknown> })
    .__coverage__;
  if (dsn && coverage) {
    const groupedCoverage: Record<string, Record<string, unknown>> = {};
    const fieldsToRemove = ["statementMap", "fnMap", "branchMap", "inputSourceMap"];

    for (const [filePath, coverageData] of Object.entries(coverage)) {
      if (coverageData && typeof coverageData === "object") {
        const buildHash = (coverageData as { buildHash?: string }).buildHash;
        if (!buildHash) {
          continue;
        }

        const cleanedData = { ...(coverageData as Record<string, unknown>) };
        for (const field of fieldsToRemove) {
          delete cleanedData[field];
        }

        if (!groupedCoverage[buildHash]) {
          groupedCoverage[buildHash] = {};
        }
        groupedCoverage[buildHash][filePath] = cleanedData;
      }
    }

    for (const [buildHash, coverageByBuildHash] of Object.entries(groupedCoverage)) {
      void fetch(dsn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        body: JSON.stringify({
          buildHash,
          coverage: coverageByBuildHash,
          scene: getScene(),
        }),
      });
    }
  }
};

const ensureListener = () => {
  if (listenerAttached) {
    return;
  }
  listenerAttached = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendCoverage();
    }
  });
};

/**
 * 注册上报逻辑（页面隐藏时发送）。可多次调用以更新 `dsn` / `scene`。
 * 不传参时与历史行为一致：仅依赖 `window.CANYON_DSN` 等。
 */
export function init(options?: CollectInitOptions): void {
  if (options?.dsn !== undefined) {
    configuredDsn = options.dsn;
  }
  if (options?.scene !== undefined) {
    configuredScene = options.scene;
  }
  ensureListener();
}

/** 立即尝试上报（例如在测试或自定义时机）。 */
export function flush(): void {
  sendCoverage();
}

init();
