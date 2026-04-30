import { describe, expect, it } from "vitest";
import { CreateRepoSchema, UpdateRepoSchema } from "../repo";

describe("CreateRepoSchema", () => {
  it("应通过合法输入", () => {
    const result = CreateRepoSchema.safeParse({
      provider: "gitlab",
      repoID: "118075",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.config).toBe("");
    }
  });

  it("provider 为空应失败", () => {
    const result = CreateRepoSchema.safeParse({
      provider: "",
      repoID: "118075",
    });
    expect(result.success).toBe(false);
  });

  it("repoID 为空应失败", () => {
    const result = CreateRepoSchema.safeParse({
      provider: "gitlab",
      repoID: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("UpdateRepoSchema", () => {
  it("空对象应通过", () => {
    expect(UpdateRepoSchema.safeParse({}).success).toBe(true);
  });

  it("部分字段应通过", () => {
    const result = UpdateRepoSchema.safeParse({ description: "新描述" });
    expect(result.success).toBe(true);
  });
});
