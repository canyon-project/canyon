import { describe, expect, it, vi } from "vitest";
import {
  generateObjectSignature,
  encodeObjectToCompressedBuffer,
  decodeCompressedObject,
  filterCoverageEntriesWithBuildHash,
  filterInvalidCoverageFiles,
} from "../helpers";

describe("generateObjectSignature", () => {
  it("相同对象应生成相同 hash", () => {
    const obj = { a: 1, b: 2 };
    expect(generateObjectSignature(obj)).toBe(generateObjectSignature(obj));
  });

  it("键顺序不同应生成相同 hash（稳定序列化）", () => {
    const a = { z: 1, a: 2 };
    const b = { a: 2, z: 1 };
    expect(generateObjectSignature(a)).toBe(generateObjectSignature(b));
  });

  it("不同对象应生成不同 hash", () => {
    const a = { a: 1 };
    const b = { a: 2 };
    expect(generateObjectSignature(a)).not.toBe(generateObjectSignature(b));
  });

  it("应返回 40 位 hex 字符串", () => {
    const sig = generateObjectSignature({ x: 1 });
    expect(sig).toMatch(/^[a-f0-9]{40}$/);
  });
});

describe("encodeObjectToCompressedBuffer / decodeCompressedObject", () => {
  it("编码后应能正确解码", () => {
    const obj = { coverage: { "src/a.ts": [1, 2, 3] } };
    const buf = encodeObjectToCompressedBuffer(obj);
    expect(decodeCompressedObject(buf)).toEqual(obj);
  });

  it("应支持 Uint8Array 输入", () => {
    const obj = { x: 1 };
    const buf = encodeObjectToCompressedBuffer(obj);
    const uint8 = new Uint8Array(buf);
    expect(decodeCompressedObject(uint8)).toEqual(obj);
  });

  it("无效数据应返回 null", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(decodeCompressedObject(Buffer.from("invalid"))).toBe(null);
    spy.mockRestore();
  });
});

describe("filterCoverageEntriesWithBuildHash", () => {
  it("应保留含自有 buildHash 的条目", () => {
    const r = filterCoverageEntriesWithBuildHash({
      "a.ts": { buildHash: "h", s: { "0": 1 } },
    });
    expect(r).toEqual({ "a.ts": { buildHash: "h", s: { "0": 1 } } });
  });

  it("应丢弃无 buildHash 或非对象的条目", () => {
    const r = filterCoverageEntriesWithBuildHash({
      "a.ts": { buildHash: "h", s: {} },
      "b.ts": { s: { "0": 1 } },
      "c.ts": null,
    });
    expect(Object.keys(r)).toEqual(["a.ts"]);
  });
});

describe("filterInvalidCoverageFiles", () => {
  it("应移除 s 全为 0 的文件", () => {
    const coverage = {
      "a.ts": { s: { "0": 0, "1": 0 }, buildHash: "h1" },
      "b.ts": { s: { "0": 1 }, buildHash: "h1" },
    };
    const r = filterInvalidCoverageFiles(coverage);
    expect(r.remainingFiles).toBe(1);
    expect(r.filteredFiles).toBe(1);
    expect(r.filteredCoverage).toHaveProperty("b.ts");
    expect(r.filteredCoverage).not.toHaveProperty("a.ts");
  });

  it("s 为空对象应过滤", () => {
    const r = filterInvalidCoverageFiles({ "x.ts": { s: {}, buildHash: "h" } });
    expect(r.remainingFiles).toBe(0);
  });
});
