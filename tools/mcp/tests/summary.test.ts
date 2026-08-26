import { describe, expect, it } from "vitest";
import {
  aggregateCoverageSummary,
  topChangedFiles,
  uncoveredChangedFiles,
} from "../src/summary.ts";

describe("coverage summary helpers", () => {
  const summary = {
    "src/a.ts": {
      path: "src/a.ts",
      change: true,
      statements: { total: 10, covered: 8, pct: 80, skipped: 0 },
      changestatements: { total: 4, covered: 2, pct: 50, skipped: 0 },
    },
    "src/b.ts": {
      path: "src/b.ts",
      change: true,
      statements: { total: 5, covered: 5, pct: 100, skipped: 0 },
      changestatements: { total: 2, covered: 2, pct: 100, skipped: 0 },
    },
    "src/c.ts": {
      path: "src/c.ts",
      change: false,
      statements: { total: 3, covered: 3, pct: 100, skipped: 0 },
    },
  };

  it("aggregates statement and change metrics", () => {
    const agg = aggregateCoverageSummary(summary);
    expect(agg.files).toBe(3);
    expect(agg.changedFiles).toBe(2);
    expect(agg.statements.total).toBe(18);
    expect(agg.changestatements.total).toBe(6);
    expect(agg.changestatements.covered).toBe(4);
  });

  it("lists uncovered changed files by gap size", () => {
    const uncovered = uncoveredChangedFiles(summary);
    expect(uncovered).toHaveLength(1);
    expect(uncovered[0]?.path).toBe("src/a.ts");
    expect(uncovered[0]?.uncoveredChangeStatements).toBe(2);
  });

  it("sorts changed files by lowest change coverage", () => {
    const top = topChangedFiles(summary);
    expect(top[0]?.path).toBe("src/a.ts");
    expect(top[1]?.path).toBe("src/b.ts");
  });
});
