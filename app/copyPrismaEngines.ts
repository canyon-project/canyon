import path from "path";
import fs from "fs";

/** 构建后将 Prisma 引擎复制到 dist，供部署使用 */
export function copyPrismaEngines() {
  return {
    name: "copy-prisma-engines",
    apply: "build",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      // schema-sqlite 打包后 __dirname=dist，engine 需在 dist
      const generatedDir = path.resolve(__dirname, "generated/schema-sqlite");
      if (fs.existsSync(generatedDir)) {
        for (const name of fs.readdirSync(generatedDir)) {
          if (name.endsWith(".node") || name.endsWith(".so.node")) {
            fs.copyFileSync(path.join(generatedDir, name), path.join(outDir, name));
          }
        }
      }
      // @prisma/client engine 也复制到 dist（Prisma 会在此路径搜索）
      const prismaPaths = [
        path.resolve(__dirname, "node_modules/.prisma/client"),
        path.resolve(__dirname, "node_modules/@prisma/client/node_modules/.prisma/client"),
      ];
      const pnpmDir = path.resolve(__dirname, "node_modules/.pnpm");
      if (fs.existsSync(pnpmDir)) {
        for (const p of fs.readdirSync(pnpmDir)) {
          if (p.startsWith("@prisma+client")) {
            prismaPaths.push(path.join(pnpmDir, p, "node_modules/.prisma/client"));
            break;
          }
        }
      }
      for (const prismaClientDir of prismaPaths) {
        if (fs.existsSync(prismaClientDir)) {
          for (const name of fs.readdirSync(prismaClientDir)) {
            if (name.endsWith(".node") || name.endsWith(".so.node")) {
              fs.copyFileSync(path.join(prismaClientDir, name), path.join(outDir, name));
            }
          }
          break;
        }
      }
    },
  };
}
