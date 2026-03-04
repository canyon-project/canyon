import { describe, expect, it } from "vitest";
import { CoverageClientSchema, CoverageMapInitSchema, CoverageMapQuerySchema } from "../coverage";

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

describe("CoverageMapQuerySchema", () => {
  it("应通过合法查询", () => {
    const result = CoverageMapQuerySchema.safeParse({
      subject: "commit",
      subjectID: "abc123",
      provider: "gitlab",
      repoID: "126555",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.buildTarget).toBe("");
    }
  });

  it("subject 枚举外应失败", () => {
    const result = CoverageMapQuerySchema.safeParse({
      subject: "invalid",
      subjectID: "x",
      provider: "gitlab",
      repoID: "1",
    });
    expect(result.success).toBe(false);
  });
});
