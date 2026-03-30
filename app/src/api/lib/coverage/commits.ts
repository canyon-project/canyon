import { prisma } from "@/api/lib/prisma.ts";
import {
  fetchExternalUserProfilesByEmails,
  normalizeEmail,
} from "@/api/lib/external-user-profile.ts";

type SceneInfo = {
  scene: Record<string, unknown>;
  sceneKey: string;
};

type BuildTargetSceneInfo = {
  buildTarget: string;
  scenes: SceneInfo[];
};

export type CommitRecord = {
  sha: string;
  /** SCM 上的 commit 页面 URL（GitLab/GitHub） */
  commitUrl?: string | null;
  branch: string;
  compareTarget: string;
  commitMessage: string;
  statements: number;
  newLines: number;
  times: number;
  latestReport: string;
  buildTarget: string;
  buildTargets: string[];
  buildTargetScenes: BuildTargetSceneInfo[];
  versionID: string;
  coverageID: string;
  reportID: string;
  reportProvider: string;
  scenes: SceneInfo[];
  provider: string;
  authorName?: string | null;
  authorEmail?: string | null;
  createdAt?: string;
  avatar?: string | null;
};

/** 从 Coverage 表按 repoID 聚合 commits */
export async function getCommitsByRepoID(repoID: string): Promise<CommitRecord[]> {
  const coverages = await prisma.coverage.findMany({
    where: { repoID },
    orderBy: { updatedAt: "desc" },
  });

  if (coverages.length === 0) return [];

  const commitsMap = new Map<string, CommitRecord>();
  const commitScenesMap = new Map<string, Map<string, SceneInfo>>();
  const commitBuildTargetsMap = new Map<string, Set<string>>();
  const commitBuildTargetScenesMap = new Map<string, Map<string, Map<string, SceneInfo>>>();
  const commitProviderMap = new Map<string, string>();

  for (const coverage of coverages) {
    const sha = coverage.sha;
    const builds = Array.isArray(coverage.builds)
      ? coverage.builds
      : typeof coverage.builds === "object" && coverage.builds !== null
        ? [coverage.builds]
        : [];
    const firstBuild = (builds[0] as Record<string, unknown>) || {};
    const branch = (firstBuild.branch as string) || "";
    const reportID = (firstBuild.reportID as string) || "";
    const reportProvider = (firstBuild.reportProvider as string) || "";

    if (!commitsMap.has(sha)) {
      commitsMap.set(sha, {
        sha,
        branch,
        compareTarget: "",
        commitMessage: "",
        statements: 0,
        newLines: 0,
        times: 0,
        latestReport: coverage.updatedAt.toISOString(),
        buildTarget: coverage.buildTarget,
        buildTargets: [],
        buildTargetScenes: [],
        versionID: coverage.buildHash,
        coverageID: coverage.id,
        reportID,
        reportProvider,
        scenes: [],
        provider: coverage.provider,
      });
      commitScenesMap.set(sha, new Map());
      commitBuildTargetsMap.set(sha, new Set<string>());
      commitBuildTargetScenesMap.set(sha, new Map());
      commitProviderMap.set(sha, coverage.provider);
    }

    const record = commitsMap.get(sha)!;
    record.times += 1;
    if (coverage.updatedAt > new Date(record.latestReport)) {
      record.latestReport = coverage.updatedAt.toISOString();
    }

    const buildTargetSet = commitBuildTargetsMap.get(sha)!;
    const buildTarget = coverage.buildTarget?.trim() !== "" ? coverage.buildTarget : "";
    if (buildTarget) buildTargetSet.add(buildTarget);

    if (!record.reportID && reportID) record.reportID = reportID;
    if (!record.reportProvider && reportProvider) record.reportProvider = reportProvider;

    const sceneMap = commitScenesMap.get(sha)!;
    if (!sceneMap.has(coverage.sceneKey)) {
      sceneMap.set(coverage.sceneKey, {
        scene: (coverage.scene as Record<string, unknown>) || {},
        sceneKey: coverage.sceneKey,
      });
    }

    if (buildTarget) {
      const buildTargetScenesMap = commitBuildTargetScenesMap.get(sha)!;
      if (!buildTargetScenesMap.has(buildTarget)) {
        buildTargetScenesMap.set(buildTarget, new Map());
      }
      const buildTargetSceneMap = buildTargetScenesMap.get(buildTarget)!;
      if (!buildTargetSceneMap.has(coverage.sceneKey)) {
        buildTargetSceneMap.set(coverage.sceneKey, {
          scene: (coverage.scene as Record<string, unknown>) || {},
          sceneKey: coverage.sceneKey,
        });
      }
    }
  }

  for (const [sha, record] of commitsMap.entries()) {
    const sceneMap = commitScenesMap.get(sha)!;
    record.scenes = Array.from(sceneMap.values());

    const buildTargetSet = commitBuildTargetsMap.get(sha)!;
    record.buildTargets = Array.from(buildTargetSet);
    if (record.buildTargets.length === 0 && record.buildTarget) {
      record.buildTargets = [record.buildTarget];
    }

    const buildTargetScenesMap = commitBuildTargetScenesMap.get(sha)!;
    record.buildTargetScenes = Array.from(buildTargetScenesMap.entries()).map(([bt, sceneMap]) => ({
      buildTarget: bt,
      scenes: Array.from(sceneMap.values()),
    }));
  }

  const commits = Array.from(commitsMap.values());
  const commitDetails = await prisma.commit.findMany({
    where: {
      content: { path: ["repoID"], equals: repoID },
    },
  });

  const detailBySha = new Map<string, (typeof commitDetails)[0]>();
  for (const d of commitDetails) {
    const c = d.content as Record<string, unknown> | null;
    if (c?.sha) detailBySha.set(c.sha as string, d);
  }

  for (const commit of commits) {
    const detail = detailBySha.get(commit.sha);
    if (detail) {
      const c = detail.content as Record<string, unknown>;
      commit.commitMessage = (c.commitMessage as string) ?? "";
      commit.authorName = (c.authorName as string) ?? null;
      commit.authorEmail = (c.authorEmail as string) ?? null;
      commit.createdAt = (c.createdAt as string) ?? undefined;
    }
  }

  const uniqueEmails = Array.from(
    new Set(
      commits
        .map((c) => normalizeEmail(c.authorEmail || ""))
        .filter((email) => email.length > 0),
    ),
  );
  const profileMap = await fetchExternalUserProfilesByEmails(uniqueEmails);

  for (const commit of commits) {
    const email = normalizeEmail(commit.authorEmail || "");
    if (!email) continue;
    const profile = profileMap.get(email);
    if (!profile) continue;
    commit.authorName = profile.nickname;
    commit.avatar = profile.avatar;
    commit.authorEmail = profile.email;
  }

  return commits.sort(
    (a, b) => new Date(b.latestReport).getTime() - new Date(a.latestReport).getTime(),
  );
}
