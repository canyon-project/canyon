import { describe, expect, it } from "vitest";
import { getApiErrorMessage, getAxiosErrorMessage } from "../api";

describe("getApiErrorMessage", () => {
  it("应从 message 字符串解析错误", async () => {
    const res = new Response(JSON.stringify({ message: "配置缺失" }), {
      status: 400,
    });
    expect(await getApiErrorMessage(res)).toBe("配置缺失");
  });

  it("应从 message 数组取第一个", async () => {
    const res = new Response(JSON.stringify({ message: ["错误1", "错误2"] }), {
      status: 400,
    });
    expect(await getApiErrorMessage(res)).toBe("错误1");
  });

  it("非 JSON 时返回状态码文案", async () => {
    const res = new Response("not json", { status: 500 });
    expect(await getApiErrorMessage(res)).toBe("请求失败: 500");
  });

  it("无 message 时返回状态码文案", async () => {
    const res = new Response(JSON.stringify({}), { status: 404 });
    expect(await getApiErrorMessage(res)).toBe("请求失败: 404");
  });
});

describe("getAxiosErrorMessage", () => {
  it("应从 response.data.message 解析", () => {
    const err = { response: { data: { message: "GitLab 配置缺失" } } };
    expect(getAxiosErrorMessage(err)).toBe("GitLab 配置缺失");
  });

  it("应从 message 数组取第一个", () => {
    const err = { response: { data: { message: ["错误1"] } } };
    expect(getAxiosErrorMessage(err)).toBe("错误1");
  });

  it("无 message 时返回状态码文案", () => {
    const err = { response: { status: 502 } };
    expect(getAxiosErrorMessage(err)).toBe("请求失败: 502");
  });

  it("Error 对象返回 message", () => {
    expect(getAxiosErrorMessage(new Error("网络错误"))).toBe("网络错误");
  });

  it("无法解析时返回 null", () => {
    expect(getAxiosErrorMessage(null)).toBe(null);
    expect(getAxiosErrorMessage({ response: {} })).toBe(null);
  });
});
