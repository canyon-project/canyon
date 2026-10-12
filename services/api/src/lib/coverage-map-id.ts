import { createHash } from "node:crypto";

/** coverage_map 行 id：由 build 与原始文件路径稳定推导 */
export function coverageMapRowId(buildHash: string, rawFilePath: string): string {
  return createHash("sha256").update(`${buildHash}\0${rawFilePath}`, "utf8").digest("hex");
}
