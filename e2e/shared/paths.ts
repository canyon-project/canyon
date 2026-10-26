import path from "node:path";
import { fileURLToPath } from "node:url";

const sharedDir = path.dirname(fileURLToPath(import.meta.url));

/** 仓库根目录 */
export const repoRoot = path.resolve(sharedDir, "../..");

/** 插桩示例应用目录 */
export const realAppDir =
  process.env.CANYON_REAL_APP_DIR ?? path.join(repoRoot, "packages/real-app");

/** Istanbul / Canyon 插桩 JSON 目录 */
export const canyonOutputDir =
  process.env.CANYON_OUTPUT_DIR ?? path.join(realAppDir, ".canyon_output");
