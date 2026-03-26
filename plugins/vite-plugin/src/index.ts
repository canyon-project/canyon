/// <reference path="./shims-babel-core.d.ts" />
import { transformAsync } from "@babel/core";
import canyonBabelPlugin from "@canyonjs/babel-plugin";
import type { Plugin } from "vite";

export interface CanyonBabelPluginConfig {
  repoID?: string;
  sha?: string;
  provider?: string;
  ci?: boolean;
  instrumentCwd?: string;
  keepMap?: boolean;
}

const DEFAULT_INCLUDE = /\.(?:[cm]?[jt]sx?)$/;
const DEFAULT_EXCLUDE = [/node_modules/];

function matches(id: string, pattern?: RegExp | RegExp[]): boolean {
  if (!pattern) return false;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  return patterns.some((item) => item.test(id));
}

function shouldTransform(id: string): boolean {
  if (id.startsWith("\0")) return false;
  const cleanId = id.split("?")[0] ?? id;
  const include = DEFAULT_INCLUDE;
  const exclude = DEFAULT_EXCLUDE;

  if (!matches(cleanId, include)) return false;
  if (matches(cleanId, exclude)) return false;
  return true;
}

export default function canyonVitePlugin(options: CanyonBabelPluginConfig = {}): Plugin {
  return {
    name: "canyon-vite-plugin",
    enforce: "post",
    async transform(code, id): Promise<any> {
      if (!shouldTransform(id)) return;

      const filename = id.split("?")[0] ?? id;
      const transformed = await transformAsync(code, {
        filename,
        sourceMaps: true,
        babelrc: false,
        configFile: false,
        plugins: [[canyonBabelPlugin, options]],
      });

      if (!transformed?.code) {
        return;
      }
      return {
        code: transformed.code,
        map: transformed.map as any,
      };
    },
  };
}
