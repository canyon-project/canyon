import { createCoverageMap } from "@vitest/istanbul-lib-coverage";
import { createSourceMapStore } from "@vitest/istanbul-lib-source-maps";

import { remapToSourceSnapshot } from "./remap.js";
import type { InstrumentFileCoverage } from "./types.js";

/** 本地演示：合并 + 回溯（pnpm --filter @canyon/data demo） */
const coverageData: Record<string, InstrumentFileCoverage> = {
  "/Users/travzhang/Desktop/canyon/packages/real-app/build/main.js": {
    path: "/Users/travzhang/Desktop/canyon/packages/real-app/build/main.js",
    statementMap: {
      "0": {
        start: { line: 2, column: 0 },
        end: { line: 2, column: 62 },
      },
      "1": {
        start: { line: 3, column: 16 },
        end: { line: 3, column: 34 },
      },
      "2": {
        start: { line: 6, column: 8 },
        end: { line: 6, column: 36 },
      },
      "3": {
        start: { line: 7, column: 8 },
        end: { line: 7, column: 40 },
      },
      "4": {
        start: { line: 10, column: 0 },
        end: { line: 10, column: 22 },
      },
    },
    fnMap: {},
    branchMap: {},
    s: { "0": 1, "1": 1, "2": 1, "3": 1, "4": 1 },
    f: { "0": 0 },
    b: {},
    inputSourceMap: {
      version: 3,
      file: "main.js",
      sourceRoot: "",
      sources: ["../src/main.ts"],
      names: [],
      mappings:
        ";;AAAA,mCAAmC;AAEnC,MAAM,IAAI;IACR,QAAQ;QACN,OAAO,CAAC,GAAG,CAAC,cAAc,CAAC,CAAC;QAC5B,OAAO,CAAC,GAAG,CAAC,gBAAQ,CAAC,CAAC,CAAC,CAAC;IAC1B,CAAC;CACF;AAED,IAAI,IAAI,EAAE,CAAC,QAAQ,EAAE,CAAC",
    },
    buildHash: "8a7dcf51075dc18f33f7bb0ff8ef4bc557a42c24",
  },
};

const coverageMap = createCoverageMap(coverageData);
coverageMap.merge(coverageMap);

const mapStore = createSourceMapStore();
const transformed = await mapStore.transformCoverage(coverageMap);
console.log("transformCoverage s:", Object.values(transformed.toJSON())[0]?.s);

const snapshot = await remapToSourceSnapshot(coverageData, "demo-build");
console.log("remapToSourceSnapshot:", snapshot);
