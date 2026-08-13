import { describe, expect, it } from "vitest";
import {
  buildCompareSpec,
  decodeCompareRef,
  encodeCompareRef,
  parseCompareSubjectID,
  serializeCompareSubjectID,
} from "../identity";

describe("encodeCompareRef / decodeCompareRef", () => {
  it("应把分支名中的 / 编成 ~，并能还原", () => {
    expect(encodeCompareRef("feature/login")).toBe("feature~login");
    expect(decodeCompareRef("feature~login")).toBe("feature/login");
  });

  it("多层路径应能往返", () => {
    const ref = "release/2026/08/foo";
    expect(decodeCompareRef(encodeCompareRef(ref))).toBe(ref);
  });
});

describe("serializeCompareSubjectID / parseCompareSubjectID", () => {
  it("双 SHA 应使用旧格式 sha...sha", () => {
    const sha1 = "a".repeat(40);
    const sha2 = "b".repeat(40);
    const spec = buildCompareSpec({
      baseKind: "sha",
      headKind: "sha",
      baseRef: sha1,
      headRef: sha2,
    });
    expect(spec.mode).toBe("commits");
    expect(spec.live).toBe(false);
    expect(serializeCompareSubjectID(spec)).toBe(`${sha1}...${sha2}`);
    expect(parseCompareSubjectID(`${sha1}...${sha2}`)).toMatchObject({
      mode: "commits",
      live: false,
      baseKind: "sha",
      headKind: "sha",
      baseRef: sha1,
      headRef: sha2,
    });
  });

  it("commit vs 分支应带 kind 前缀且 live", () => {
    const sha = "c".repeat(40);
    const spec = buildCompareSpec({
      baseKind: "sha",
      headKind: "branch",
      baseRef: sha,
      headRef: "feature/login",
    });
    expect(spec.live).toBe(true);
    const id = serializeCompareSubjectID(spec);
    expect(id).toBe(`sha:${sha}...branch:feature~login`);
    expect(parseCompareSubjectID(id)).toMatchObject({
      mode: "refs",
      live: true,
      baseKind: "sha",
      headKind: "branch",
      baseRef: sha,
      headRef: "feature/login",
    });
  });

  it("分支 vs 分支应能往返", () => {
    const spec = buildCompareSpec({
      mode: "branches",
      baseKind: "branch",
      headKind: "branch",
      baseRef: "main",
      headRef: "feat/x",
    });
    const id = serializeCompareSubjectID(spec);
    expect(parseCompareSubjectID(id)).toMatchObject({
      mode: "refs",
      live: true,
      baseRef: "main",
      headRef: "feat/x",
    });
  });

  it("MR 应以 mr:{iid} 为稳定身份", () => {
    const spec = buildCompareSpec({ mode: "mr", mrIid: "!128" });
    expect(spec).toMatchObject({ mode: "mr", live: true, mrIid: "128" });
    expect(serializeCompareSubjectID(spec)).toBe("mr:128");
    expect(parseCompareSubjectID("mr:128")).toMatchObject({
      mode: "mr",
      mrIid: "128",
      live: true,
    });
  });

  it("非法 MR IID 应抛错", () => {
    expect(() => buildCompareSpec({ mode: "mr", mrIid: "abc" })).toThrow(/MR IID/);
  });

  it("缺少两侧 ref 应抛错", () => {
    expect(() => buildCompareSpec({})).toThrow(/请提供/);
  });
});
