export function tupleToMap(t: unknown): Record<string, number> {
  if (!Array.isArray(t) || t.length !== 2) return {} as Record<string, number>;
  const [keys, values] = t as [unknown[], unknown[]];
  const out: Record<string, number> = {};
  const len = Math.min(keys?.length ?? 0, values?.length ?? 0);
  for (let i = 0; i < len; i++) {
    out[String(keys[i])] = Number((values[i] as number) ?? 0);
  }
  return out;
}

export function trimInstrumentCwd(p: string, instrumentCwd: string): string {
  if (!instrumentCwd) return p;
  let np = p.startsWith(instrumentCwd) ? p.slice(instrumentCwd.length) : p;
  if (np.startsWith('/')) np = np.slice(1);
  return np;
}

export function canonicalizeSnippet(s: string): string {
  return s.replace(/\s+/g, '');
}

export function computeLineStarts(content: string): number[] {
  const starts = [0];
  for (let i = 0; i < content.length; i++)
    if (content[i] === '\n') starts.push(i + 1);
  return starts;
}

export function posToOffset(
  line: number,
  col: number,
  starts: number[],
): number {
  const idx = Math.max(0, Math.min(starts.length - 1, line - 1));
  return starts[idx] + col;
}

export function sliceByStmtLoc(
  content: string,
  info:
    | {
        start?: { line?: number; column?: number };
        end?: { line?: number; column?: number };
      }
    | undefined,
  starts: number[],
): [string, number] {
  const startLoc = info?.start || { line: 0, column: 0 };
  const endLoc = info?.end || { line: 0, column: 0 };
  const start = posToOffset(
    Number(startLoc.line || 0),
    Number(startLoc.column || 0),
    starts,
  );
  const end = posToOffset(
    Number(endLoc.line || 0),
    Number(endLoc.column || 0),
    starts,
  );
  const s = Math.max(0, Math.min(start, content.length));
  const e = Math.max(s, Math.min(end, content.length));
  return [content.slice(s, e), s];
}

export function buildStmtHashGroups(
  content: string,
  stmtMap: Record<
    string,
    {
      start?: { line?: number; column?: number };
      end?: { line?: number; column?: number };
    }
  >,
): Map<string, Array<{ id: string; pos: number }>> {
  const groups = new Map<string, Array<{ id: string; pos: number }>>();
  if (!stmtMap) return groups;
  const starts = computeLineStarts(content);
  for (const [id, st] of Object.entries(stmtMap)) {
    const [code, pos] = sliceByStmtLoc(content, st, starts);
    const h = canonicalizeSnippet(code);
    const arr = groups.get(h) || [];
    arr.push({ id, pos });
    groups.set(h, arr);
  }
  for (const [h, arr] of groups) {
    arr.sort((a, b) => a.pos - b.pos);
    groups.set(h, arr);
  }
  return groups;
}

export function sliceByFnLoc(
  content: string,
  info:
    | {
        loc?: {
          start?: { line?: number; column?: number };
          end?: { line?: number; column?: number };
        };
      }
    | undefined,
  starts: number[],
): [string, number] {
  const loc = info?.loc || {
    start: { line: 0, column: 0 },
    end: { line: 0, column: 0 },
  };
  const start = posToOffset(
    Number(loc.start?.line || 0),
    Number(loc.start?.column || 0),
    starts,
  );
  const end = posToOffset(
    Number(loc.end?.line || 0),
    Number(loc.end?.column || 0),
    starts,
  );
  const s = Math.max(0, Math.min(start, content.length));
  const e = Math.max(s, Math.min(end, content.length));
  return [content.slice(s, e), s];
}

export function buildFnHashGroups(
  content: string,
  fnMap: Record<
    string,
    {
      loc?: {
        start?: { line?: number; column?: number };
        end?: { line?: number; column?: number };
      };
    }
  >,
): Map<string, Array<{ id: string; pos: number }>> {
  const groups = new Map<string, Array<{ id: string; pos: number }>>();
  if (!fnMap) return groups;
  const starts = computeLineStarts(content);
  for (const [id, fn] of Object.entries(fnMap)) {
    const [code, pos] = sliceByFnLoc(content, fn, starts);
    const h = canonicalizeSnippet(code);
    const arr = groups.get(h) || [];
    arr.push({ id, pos });
    groups.set(h, arr);
  }
  for (const [h, arr] of groups) {
    arr.sort((a, b) => a.pos - b.pos);
    groups.set(h, arr);
  }
  return groups;
}

export function mergeStatementHitsByBlock(
  baseContent: string,
  baseStmtMap: Record<
    string,
    {
      start?: { line?: number; column?: number };
      end?: { line?: number; column?: number };
    }
  >,
  otherContent: string,
  otherStmtMap: Record<
    string,
    {
      start?: { line?: number; column?: number };
      end?: { line?: number; column?: number };
    }
  >,
  otherHits: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};
  if (!baseStmtMap || !otherStmtMap || !otherHits) return result;
  const baseGroups = buildStmtHashGroups(baseContent, baseStmtMap);
  const otherGroups = buildStmtHashGroups(otherContent, otherStmtMap);
  for (const [h, baseNodes] of baseGroups) {
    const otherNodes = otherGroups.get(h);
    if (!otherNodes || otherNodes.length === 0) continue;
    const used = new Array<boolean>(otherNodes.length).fill(false);
    for (const bn of baseNodes) {
      let best = -1;
      let bestDist = Number.MAX_SAFE_INTEGER;
      for (let i = 0; i < otherNodes.length; i++) {
        if (used[i]) continue;
        const d = Math.abs(bn.pos - otherNodes[i].pos);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (best >= 0) {
        used[best] = true;
        const inc = otherHits[String(otherNodes[best].id)] || 0;
        if (inc > 0) result[String(bn.id)] = (result[String(bn.id)] || 0) + inc;
      }
    }
  }
  return result;
}

export function mergeFunctionHitsByBlock(
  baseContent: string,
  baseFnMap: Record<
    string,
    {
      loc?: {
        start?: { line?: number; column?: number };
        end?: { line?: number; column?: number };
      };
    }
  >,
  otherContent: string,
  otherFnMap: Record<
    string,
    {
      loc?: {
        start?: { line?: number; column?: number };
        end?: { line?: number; column?: number };
      };
    }
  >,
  otherHits: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};
  if (!baseFnMap || !otherFnMap || !otherHits) return result;
  const baseGroups = buildFnHashGroups(baseContent, baseFnMap);
  const otherGroups = buildFnHashGroups(otherContent, otherFnMap);
  for (const [h, baseNodes] of baseGroups) {
    const otherNodes = otherGroups.get(h);
    if (!otherNodes || otherNodes.length === 0) continue;
    const used = new Array<boolean>(otherNodes.length).fill(false);
    for (const bn of baseNodes) {
      let best = -1;
      let bestDist = Number.MAX_SAFE_INTEGER;
      for (let i = 0; i < otherNodes.length; i++) {
        if (used[i]) continue;
        const d = Math.abs(bn.pos - otherNodes[i].pos);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (best >= 0) {
        used[best] = true;
        const inc = otherHits[String(otherNodes[best].id)] || 0;
        if (inc > 0) result[String(bn.id)] = (result[String(bn.id)] || 0) + inc;
      }
    }
  }
  return result;
}

// -------------------------
// Pure helpers for summary
// -------------------------

export type CoverageFileMapEntry = {
  path: string;
  statementMap?: Record<string, unknown>;
  fnMap?: Record<string, unknown>;
  branchMap?: Record<string, { locations?: unknown[] }>;
  s?: Record<string, number>;
  f?: Record<string, number>;
  b?: Record<string, number[]>;
};

export type CoverageFileSummary = {
  path: string;
  statements: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
  newlines: { total: number; covered: number; pct: number };
};

export function computeStatementsSummary(
  sMap: Record<string, number> = {},
  statementMap?: Record<string, unknown>,
): { total: number; covered: number } {
  const total = statementMap
    ? Object.keys(statementMap).length
    : Object.keys(sMap).length;
  const covered = Object.values(sMap).reduce(
    (a, n) => a + (Number(n) > 0 ? 1 : 0),
    0,
  );
  return { total, covered };
}

export function computeFunctionsSummary(
  fMap: Record<string, number> = {},
  fnMap?: Record<string, unknown>,
): { total: number; covered: number } {
  const total = fnMap ? Object.keys(fnMap).length : Object.keys(fMap).length;
  const covered = Object.values(fMap).reduce(
    (a, n) => a + (Number(n) > 0 ? 1 : 0),
    0,
  );
  return { total, covered };
}

export function computeBranchesSummary(
  bArrMap: Record<string, number[]> = {},
  branchMap?: Record<string, { locations?: unknown[] }>,
): { total: number; covered: number } {
  const total = branchMap
    ? (Object.values(branchMap) as Array<{ locations?: unknown[] }>).reduce(
        (a, info) =>
          a + (Array.isArray(info.locations) ? info.locations.length : 0),
        0,
      )
    : Object.values(bArrMap).reduce((a, arr) => a + (arr?.length || 0), 0);
  const covered = Object.values(bArrMap).reduce(
    (a, arr) =>
      a +
      (Array.isArray(arr)
        ? arr.reduce((x, y) => x + (Number(y) > 0 ? 1 : 0), 0)
        : 0),
    0,
  );
  return { total, covered };
}

export function summarizeCoverageFile(
  entry: CoverageFileMapEntry,
  percentFn: (covered: number, total: number) => number,
): CoverageFileSummary {
  const sMap = entry.s || {};
  const fMap = entry.f || {};
  const bArrMap = entry.b || {};
  const s = computeStatementsSummary(
    sMap,
    entry.statementMap as Record<string, unknown> | undefined,
  );
  const f = computeFunctionsSummary(
    fMap,
    entry.fnMap as Record<string, unknown> | undefined,
  );
  const b = computeBranchesSummary(bArrMap, entry.branchMap);
  return {
    path: entry.path,
    statements: {
      total: s.total,
      covered: s.covered,
      pct: percentFn(s.covered, s.total),
    },
    functions: {
      total: f.total,
      covered: f.covered,
      pct: percentFn(f.covered, f.total),
    },
    branches: {
      total: b.total,
      covered: b.covered,
      pct: percentFn(b.covered, b.total),
    },
    newlines: { total: 0, covered: 0, pct: 0 },
  };
}

export function summarizeCoverageFromMap(
  map: Record<string, CoverageFileMapEntry>,
  percentFn: (covered: number, total: number) => number,
): Record<string, CoverageFileSummary> {
  const result: Record<string, CoverageFileSummary> = {};
  if (!map) return result;
  for (const v of Object.values(map)) {
    const summary = summarizeCoverageFile(v, percentFn);
    result[summary.path] = summary;
  }
  return result;
}
