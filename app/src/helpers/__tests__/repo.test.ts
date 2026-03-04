import { describe, expect, it } from "vitest";
import { getRepoIDFromId } from "../repo";

describe("getRepoIDFromId", () => {
  it("应从 provider-repoID 格式中取出 repoID", () => {
    expect(getRepoIDFromId("gitlab-126555")).toBe("126555");
    expect(getRepoIDFromId("github-123")).toBe("123");
  });

  it("无 '-' 时原样返回", () => {
    expect(getRepoIDFromId("126555")).toBe("126555");
    expect(getRepoIDFromId("abc")).toBe("abc");
  });

  it("应处理 undefined 和 null", () => {
    expect(getRepoIDFromId(undefined)).toBe("");
    expect(getRepoIDFromId(null)).toBe("");
  });

  it("空字符串返回空字符串", () => {
    expect(getRepoIDFromId("")).toBe("");
  });
});
