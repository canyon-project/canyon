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
