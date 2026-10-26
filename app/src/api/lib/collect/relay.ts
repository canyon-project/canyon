export type CollectRelayRoute = "client" | "map-init";

const DEFAULT_TIMEOUT_MS = 5000;

function relayTimeoutMs(): number {
  const raw = Number(process.env.COVERAGE_COLLECT_RELAY_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
}

/**
 * 覆盖率上报中转口子。
 * 设置 COVERAGE_COLLECT_RELAY_URL 后，把 /client 与 /map/init 的原始请求体再 POST 一次到该地址。
 * 未配置时不发请求。中转失败只打日志，不打断本地处理。
 */
export function relayCollectPayload(route: CollectRelayRoute, body: unknown): void {
  console.log("[coverage:collect:relay] relayCollectPayload", {
    route,
    body,
  });
  const url = process.env.COVERAGE_COLLECT_RELAY_URL?.trim();
  if (!url) return;

  void fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-canyon-collect-route": route,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(relayTimeoutMs()),
  })
    .then((res) => {
      if (!res.ok) {
        console.error("[coverage:collect:relay] upstream rejected", {
          route,
          status: res.status,
        });
      }
    })
    .catch((error) => {
      console.error("[coverage:collect:relay] failed", {
        route,
        error: error instanceof Error ? error.message : String(error),
      });
    });
}
