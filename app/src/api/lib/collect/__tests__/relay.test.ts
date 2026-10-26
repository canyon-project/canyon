import { afterEach, describe, expect, it, vi } from "vitest";
import { relayCollectPayload } from "../relay.ts";

describe("relayCollectPayload", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("未配置地址时不发起请求", () => {
    vi.stubEnv("COVERAGE_COLLECT_RELAY_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    relayCollectPayload("client", { a: 1 });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("配置地址后把原始 body POST 到该接口", async () => {
    vi.stubEnv("COVERAGE_COLLECT_RELAY_URL", "https://example.com/hook");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    relayCollectPayload("map-init", { sha: "abc" });

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://example.com/hook");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ sha: "abc" }));
    expect(init.headers).toMatchObject({
      "content-type": "application/json",
      "x-canyon-collect-route": "map-init",
    });
  });
});
