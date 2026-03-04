import { describe, expect, it } from "vitest";
import { getDecode } from "../getDecode";

describe("getDecode", () => {
  it("应正确解码 base64 编码的 URI 字符串", () => {
    // "hello" -> base64 -> btoa("hello") 在浏览器是 btoa，Node 用 Buffer
    const encoded = Buffer.from("hello", "utf-8").toString("base64");
    expect(getDecode(encoded)).toBe("hello");
  });

  it("应正确解码中文", () => {
    const str = "你好世界";
    const encoded = Buffer.from(str, "utf-8").toString("base64");
    expect(getDecode(encoded)).toBe(str);
  });

  it("应正确解码带特殊字符的路径", () => {
    const path = "src/utils/foo.ts";
    const encoded = Buffer.from(path, "utf-8").toString("base64");
    expect(getDecode(encoded)).toBe(path);
  });
});
