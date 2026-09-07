import { describe, expect, it } from "vitest";
import { CoverageClientSchema, CoverageMapInitSchema } from "../coverage";

describe("CoverageClientSchema", () => {
  it("应通过合法 coverage 对象", () => {
    const result = CoverageClientSchema.safeParse({
      coverage: { "src/a.ts": { s: {}, f: {}, b: {} } },
    });
    expect(result.success).toBe(true);
  });

  it("coverage 缺失应失败", () => {
    expect(CoverageClientSchema.safeParse({}).success).toBe(false);
  });
});

describe("CoverageMapInitSchema", () => {
  it("sha 应为 40 位 hex", () => {
    const valid = CoverageMapInitSchema.safeParse({
      sha: "a".repeat(40),
      coverage: {},
    });
    expect(valid.success).toBe(true);

    const invalid = CoverageMapInitSchema.safeParse({
      sha: "short",
      coverage: {},
    });
    expect(invalid.success).toBe(false);
  });
});
