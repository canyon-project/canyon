import { prisma } from "@/api/lib/prisma.ts";
import {getNewScm} from "@/api/lib/scm.ts";
import { decodeCompressedObject } from "@/api/lib/collect/helpers.ts";
import {
  addBranchHitMaps,
  addMaps,
  ensureBranchHitMap,
  ensureNumMap,
  type BranchHitMap,
  type NumMap,
} from "@/api/lib/collect/coverage-merge.util.ts";
import { testExclude } from "@/api/lib/coverage/test-exclude.ts";
import { remapCoverageByOld } from "canyon-map";

export interface CoverageMapForCompareParams {
  provider: string;
  repoID: string;
  compareID: string;
  buildTarget?: string;
  filePath?: string;
  scene?: string;
}

function buildSceneQueryCondition(scene?: string) {
  if (!scene) return undefined;
  try {
    const sceneObj = JSON.parse(scene);
    if (typeof sceneObj !== "object" || sceneObj === null || Array.isArray(sceneObj))
      return undefined;
    const entries = Object.entries(sceneObj);
    if (entries.length === 0) return undefined;
    if (entries.length === 1) {
      const [key, value] = entries[0];
      return { path: [key], equals: String(value) };
    }
    return { AND: entries.map(([key, value]) => ({ path: [key], equals: String(value) })) };
  } catch {
    return undefined;
  }
}

function normalizeBranchHitsForRemap(
  fileCoverage: Record<string, unknown>,
): Record<string, unknown> {
  const branchMap =
    fileCoverage.branchMap &&
    typeof fileCoverage.branchMap === "object" &&
    !Array.isArray(fileCoverage.branchMap)
      ? (fileCoverage.branchMap as Record<string, unknown>)
      : {};
  const rawB =
    fileCoverage.b && typeof fileCoverage.b === "object" && !Array.isArray(fileCoverage.b)
      ? (fileCoverage.b as Record<string, unknown>)
      : {};
  const normalizedB = ensureBranchHitMap(rawB);

  for (const [branchID, branchNode] of Object.entries(branchMap)) {
    const existing = normalizedB[branchID] || [];
    const locationLen = Array.isArray((branchNode as { locations?: unknown[] })?.locations)
      ? ((branchNode as { locations?: unknown[] }).locations?.length ?? 0)
      : 0;
    const targetLen = Math.max(existing.length, locationLen);
    normalizedB[branchID] = Array.from({ length: targetLen }, (_, idx) => Number(existing[idx] || 0));
  }

  return { ...fileCoverage, b: normalizedB };
}

/**
 * 按 compare（commit1...commit2）查询对比覆盖率 map
 * 合并 from..to 之间所有 commit 的 hit 数据到 headSha 的 map 上
 */
export async function getCoverageMapForCompare(params: CoverageMapForCompareParams): Promise<
  | {
      success: true;
      baseCommit: string;
      comparisonResults: unknown[];
      coverage: Record<string, unknown>;
    }
  | { success: false; message: string }
> {
  const { provider, repoID, compareID, buildTarget = "", filePath, scene } = params;

  console.log("getCoverageMapForCompare", params);

  const [baseSha, headSha] = compareID.split("...");
  if (!baseSha || !headSha) {
    return { success: false, message: "compareID 格式错误，应为 baseSha...headSha" };
  }

  const diffWhere: { from: string; to: string; provider: string; repoID: string; path?: string } = {
    from: baseSha,
    to: headSha,
    provider,
    repoID,
  };
  if (filePath) diffWhere.path = filePath;

  const diffList = await prisma.diff.findMany({
    where: diffWhere,
    select: { path: true, additions: true, deletions: true },
  });

  const scm = getNewScm(provider);
  if (!scm) return { success: false, message: "SCM 配置缺失" };

  const filteredCommits = await scm.getCommitsBetween(repoID, baseSha, headSha);
  const headShaIndex = filteredCommits.indexOf(headSha);
  if (headShaIndex === -1)
    return { success: false, message: "headSha not found in filtered commits" };

  const headShaCoverageWhere: Record<string, unknown> = {
    provider,
    repoID,
    sha: headSha,
    buildTarget,
  };
  const sceneCondition = buildSceneQueryCondition(scene);
  if (sceneCondition) headShaCoverageWhere.scene = sceneCondition;

  const headShaCoverageRecords = await prisma.coverage.findMany({
    where: headShaCoverageWhere as never,
  });
  if (headShaCoverageRecords.length === 0) {
    return { success: false, message: "No coverage records found for headSha" };
  }

  const headShaCoverageRecord = headShaCoverageRecords[0];
  const { instrumentCwd: headShaInstrumentCwd, buildHash: headShaBuildHash } =
    headShaCoverageRecord;
  const headShaInstrumentCwdPrefix = headShaInstrumentCwd + "/";

  const headShaMapRelations = await prisma.coverageMapRelation.findMany({
    where: {
      buildHash: headShaBuildHash,
      fullFilePath: { in: diffList.map((d) => headShaInstrumentCwdPrefix + d.path) },
    },
  });

  const headShaCoverageMapHashKeySet = new Set<string>();
  const headShaSourceMapHashSet = new Set<string>();
  for (const r of headShaMapRelations) {
    headShaCoverageMapHashKeySet.add(`${r.coverageMapHash}|${r.fileContentHash}`);
    if (r.sourceMapHash) headShaSourceMapHashSet.add(r.sourceMapHash);
  }

  const [headShaCoverageMaps, headShaSourceMaps] = await Promise.all([
    prisma.coverageMap.findMany({
      where: { hash: { in: Array.from(headShaCoverageMapHashKeySet) } },
    }),
    prisma.coverageSourceMap.findMany({
      where: { hash: { in: Array.from(headShaSourceMapHashSet) } },
    }),
  ]);

  const headShaCoverageMapIndex = new Map(headShaCoverageMaps.map((m) => [m.hash, m]));
  const headShaSourceMapIndex = new Map(headShaSourceMaps.map((s) => [s.hash, s]));

  const headShaFileCoverageMap = new Map<string, Record<string, unknown>>();
  for (const r of headShaMapRelations) {
    const rawFilePath = r.restoreFullFilePath || r.fullFilePath;
    const normalizedPath = rawFilePath.startsWith(headShaInstrumentCwdPrefix)
      ? rawFilePath.slice(headShaInstrumentCwdPrefix.length)
      : rawFilePath;
    const sm = headShaSourceMapIndex.get(r.sourceMapHash);
    const cm = headShaCoverageMapIndex.get(`${r.coverageMapHash}|${r.fileContentHash}`);
    if (!cm) continue;
    const decoded = decodeCompressedObject(cm.map);
    if (!decoded || typeof decoded !== "object") continue;
    headShaFileCoverageMap.set(normalizedPath, {
      path: rawFilePath,
      fileContentHash: r.fileContentHash,
      ...(decoded as Record<string, unknown>),
      inputSourceMap: sm ? decodeCompressedObject(sm.sourceMap) : undefined,
    });
  }

  const headShaSceneKeys = new Set(headShaCoverageRecords.map((r) => r.sceneKey));
  const headShaCoverageHits = await prisma.coverageHit.findMany({
    where: {
      buildHash: headShaBuildHash,
      ...(headShaSceneKeys.size > 0 && { sceneKey: { in: Array.from(headShaSceneKeys) } }),
    },
  });

  const headShaHitDataByFile = new Map<string, { s: NumMap; f: NumMap; b: BranchHitMap }>();
  for (const h of headShaCoverageHits) {
    const np = h.rawFilePath.startsWith(headShaInstrumentCwdPrefix)
      ? h.rawFilePath.slice(headShaInstrumentCwdPrefix.length)
      : h.rawFilePath;
    if (!headShaHitDataByFile.has(np)) headShaHitDataByFile.set(np, { s: {}, f: {}, b: {} });
    const fd = headShaHitDataByFile.get(np)!;
    fd.s = addMaps(fd.s, ensureNumMap(h.s as Record<string, unknown>));
    fd.f = addMaps(fd.f, ensureNumMap(h.f as Record<string, unknown>));
    fd.b = addBranchHitMaps(fd.b, ensureBranchHitMap(h.b as Record<string, unknown>));
  }

  type CommitData = {
    hitDataByFile: Map<string, { s: NumMap; f: NumMap; b: BranchHitMap }>;
    fileCoverageMap: Map<string, Record<string, unknown>>;
  };
  const commitDataMap = new Map<string, CommitData>();
  const comparisonResults: unknown[] = [];

  for (const sha of filteredCommits) {
    if (sha === headSha) continue;

    const covWhere: Record<string, unknown> = { provider, repoID, sha, buildTarget };
    if (sceneCondition) covWhere.scene = sceneCondition;
    const coverageRecords = await prisma.coverage.findMany({ where: covWhere as never });
    if (coverageRecords.length === 0) continue;

    const { instrumentCwd, buildHash } = coverageRecords[0];
    const prefix = instrumentCwd + "/";

    const mapRelations = await prisma.coverageMapRelation.findMany({
      where: {
        buildHash,
        fullFilePath: { in: diffList.map((d) => prefix + d.path) },
      },
    });

    const cmHashSet = new Set<string>();
    const smHashSet = new Set<string>();
    for (const r of mapRelations) {
      cmHashSet.add(`${r.coverageMapHash}|${r.fileContentHash}`);
      if (r.sourceMapHash) smHashSet.add(r.sourceMapHash);
    }

    const [coverageMaps, sourceMaps] = await Promise.all([
      prisma.coverageMap.findMany({ where: { hash: { in: Array.from(cmHashSet) } } }),
      prisma.coverageSourceMap.findMany({ where: { hash: { in: Array.from(smHashSet) } } }),
    ]);

    const cmIndex = new Map(coverageMaps.map((m) => [m.hash, m]));
    const smIndex = new Map(sourceMaps.map((s) => [s.hash, s]));

    const fileCoverageMap = new Map<string, Record<string, unknown>>();
    for (const r of mapRelations) {
      const raw = r.restoreFullFilePath || r.fullFilePath;
      const np = raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
      const sm = smIndex.get(r.sourceMapHash);
      const cm = cmIndex.get(`${r.coverageMapHash}|${r.fileContentHash}`);
      if (!cm) continue;
      const decoded = decodeCompressedObject(cm.map);
      if (!decoded || typeof decoded !== "object") continue;
      fileCoverageMap.set(np, {
        path: raw,
        fileContentHash: r.fileContentHash,
        ...(decoded as Record<string, unknown>),
        inputSourceMap: sm ? decodeCompressedObject(sm.sourceMap) : undefined,
      });
    }

    const sceneKeys = new Set(coverageRecords.map((r) => r.sceneKey));
    const hits = await prisma.coverageHit.findMany({
      where: {
        buildHash,
        ...(sceneKeys.size > 0 && { sceneKey: { in: Array.from(sceneKeys) } }),
      },
    });

    const hitDataByFile = new Map<string, { s: NumMap; f: NumMap; b: BranchHitMap }>();
    for (const h of hits) {
      const np = h.rawFilePath.startsWith(prefix)
        ? h.rawFilePath.slice(prefix.length)
        : h.rawFilePath;
      if (!hitDataByFile.has(np)) hitDataByFile.set(np, { s: {}, f: {}, b: {} });
      const fd = hitDataByFile.get(np)!;
      fd.s = addMaps(fd.s, ensureNumMap(h.s as Record<string, unknown>));
      fd.f = addMaps(fd.f, ensureNumMap(h.f as Record<string, unknown>));
      fd.b = addBranchHitMaps(fd.b, ensureBranchHitMap(h.b as Record<string, unknown>));
    }

    commitDataMap.set(sha, { hitDataByFile, fileCoverageMap });

    const fileComparisons: unknown[] = [];
    for (const [fp, headShaFile] of headShaFileCoverageMap.entries()) {
      const other = fileCoverageMap.get(fp);
      if (!other) {
        fileComparisons.push({ filePath: fp, status: "missing" });
        continue;
      }
      const hashEqual = headShaFile.fileContentHash === other.fileContentHash;
      if (hashEqual) {
        fileComparisons.push({ filePath: fp, status: "fileContentHashEqual", canMerge: true });
        continue;
      }
      const nowStmt = (headShaFile.statementMap as Record<string, { contentHash?: string }>) || {};
      const otherStmt = (other.statementMap as Record<string, { contentHash?: string }>) || {};
      const nowHashToIds = new Map<string, string[]>();
      const otherHashToIds = new Map<string, string[]>();
      for (const [id, st] of Object.entries(nowStmt)) {
        if (st?.contentHash) {
          if (!nowHashToIds.has(st.contentHash)) nowHashToIds.set(st.contentHash, []);
          nowHashToIds.get(st.contentHash)!.push(id);
        }
      }
      for (const [id, st] of Object.entries(otherStmt)) {
        if (st?.contentHash) {
          if (!otherHashToIds.has(st.contentHash)) otherHashToIds.set(st.contentHash, []);
          otherHashToIds.get(st.contentHash)!.push(id);
        }
      }
      const mergeable: Array<{
        contentHash: string;
        headShaStatementId: string;
        otherStatementId: string;
      }> = [];
      for (const [ch, nowIds] of nowHashToIds.entries()) {
        const otherIds = otherHashToIds.get(ch) || [];
        if (nowIds.length === 1 && otherIds.length === 1) {
          mergeable.push({
            contentHash: ch,
            headShaStatementId: nowIds[0],
            otherStatementId: otherIds[0],
          });
        }
      }
      fileComparisons.push({
        filePath: fp,
        status: "fileContentHashDifferent",
        canMerge: mergeable.length > 0,
        mergeableStatements: mergeable,
      });
    }
    comparisonResults.push({ commitSha: sha, fileComparisons });
  }

  const mergedCoverageData: Record<string, Record<string, unknown>> = {};
  for (const [fp, headShaFile] of headShaFileCoverageMap.entries()) {
    const hitData = headShaHitDataByFile.get(fp);
    if (!hitData) continue;
    mergedCoverageData[fp] = {
      ...headShaFile,
      s: { ...hitData.s },
      f: { ...hitData.f },
      b: { ...hitData.b },
    };
  }

  for (let i = 0; i < filteredCommits.length; i++) {
    const sha = filteredCommits[i];
    if (sha === headSha) continue;
    const comp = comparisonResults.find((r: { commitSha?: string }) => r.commitSha === sha);
    const commitData = commitDataMap.get(sha);
    if (!comp || !commitData) continue;

    const fileComps = (comp as { fileComparisons?: unknown[] }).fileComparisons || [];
    for (const fc of fileComps) {
      const fp = (fc as { filePath?: string }).filePath;
      if (!fp) continue;
      const commitHit = commitData.hitDataByFile.get(fp);
      const merged = mergedCoverageData[fp];
      if (!commitHit || !merged) continue;

      const status = (fc as { status?: string }).status;
      const canMerge = (fc as { canMerge?: boolean }).canMerge;
      const mergeable = (
        fc as {
          mergeableStatements?: Array<{
            contentHash: string;
            headShaStatementId: string;
            otherStatementId: string;
          }>;
        }
      ).mergeableStatements;

      if (status === "fileContentHashEqual") {
        merged.s = addMaps(merged.s as NumMap, commitHit.s);
        merged.f = addMaps(merged.f as NumMap, commitHit.f);
        merged.b = addBranchHitMaps(
          ensureBranchHitMap(merged.b as Record<string, unknown>),
          commitHit.b,
        );
      } else if (status === "fileContentHashDifferent" && canMerge && mergeable?.length) {
        const otherFile = commitData.fileCoverageMap.get(fp);
        if (!otherFile) continue;
        const otherStmt =
          (otherFile.statementMap as Record<string, { contentHash?: string }>) || {};
        const otherIdToHash = new Map<string, string>();
        for (const [id, st] of Object.entries(otherStmt)) {
          if (st?.contentHash) otherIdToHash.set(id, st.contentHash);
        }
        const hashToNowId = new Map(mergeable.map((m) => [m.contentHash, m.headShaStatementId]));
        for (const [otherId, count] of Object.entries(commitHit.s)) {
          const ch = otherIdToHash.get(otherId);
          const nowId = ch ? hashToNowId.get(ch) : undefined;
          if (nowId) {
            (merged.s as Record<string, number>)[nowId] =
              ((merged.s as Record<string, number>)[nowId] || 0) + count;
          }
        }
        const otherFn = (otherFile.fnMap as Record<string, { contentHash?: string }>) || {};
        const otherFnIdToHash = new Map<string, string>();
        for (const [id, fn] of Object.entries(otherFn)) {
          if (fn?.contentHash) otherFnIdToHash.set(id, fn.contentHash);
        }
        const nowFn = (merged.fnMap as Record<string, { contentHash?: string }>) || {};
        const fnHashToNowId = new Map<string, string>();
        for (const [nowId, fn] of Object.entries(nowFn)) {
          if (fn?.contentHash) {
            for (const [_otherId, otherFnEntry] of Object.entries(otherFn)) {
              if ((otherFnEntry as { contentHash?: string })?.contentHash === fn.contentHash) {
                fnHashToNowId.set(fn.contentHash, nowId);
                break;
              }
            }
          }
        }
        for (const [otherId, count] of Object.entries(commitHit.f)) {
          const ch = otherFnIdToHash.get(otherId);
          const nowId = ch ? fnHashToNowId.get(ch) : undefined;
          if (nowId) {
            (merged.f as Record<string, number>)[nowId] =
              ((merged.f as Record<string, number>)[nowId] || 0) + count;
          }
        }
      }
    }
  }

  const normalizedForRemap = Object.fromEntries(
    Object.entries(mergedCoverageData).map(([fp, item]) => [
      fp,
      normalizeBranchHitsForRemap(item),
    ]),
  );
  const remapped = await remapCoverageByOld(normalizedForRemap);
  const diffListMap = new Map(diffList.map((d) => [d.path, (d.additions as number[]) || []]));

  const normalizedCoverage: Record<string, Record<string, unknown>> = {};
  for (const [fp, fc] of Object.entries(
    remapped as Record<string, Record<string, unknown> & { path?: string }>,
  )) {
    const np = fp.startsWith(headShaInstrumentCwdPrefix)
      ? fp.slice(headShaInstrumentCwdPrefix.length)
      : fp;
    normalizedCoverage[np] = {
      ...fc,
      path: np,
      diff: { additions: diffListMap.get(np) || [] },
    };
  }

  const finalCoverage = testExclude(
    normalizedCoverage,
    JSON.stringify({ exclude: ["dist/**"] }),
  ) as Record<string, unknown>;

  return { success: true, baseCommit: headSha, comparisonResults, coverage: finalCoverage };
}
