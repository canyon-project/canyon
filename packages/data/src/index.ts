export { assembleInstrumentCoverage } from "./assemble.js";
export { remapToSourceSnapshot } from "./remap.js";
export type { AssembleFileInput, InstrumentFileCoverage, SnapshotFileCoverage } from "./types.js";

export { createCoverageMap } from "@vitest/istanbul-lib-coverage";
export { createSourceMapStore } from "@vitest/istanbul-lib-source-maps";
