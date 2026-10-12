const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export type CoverageTagSummary = {
  tagKey: string;
  tag: {
    source?: string;
    type?: string;
    env?: string;
    trigger?: string;
    [key: string]: unknown;
  };
};

export type CoverageBuild = {
  buildHash: string;
  provider: string;
  repoId: string;
  sha: string;
  buildTarget: string;
  instrumentCwd: string;
  fileCount: number;
  hitCount: number;
  tagCount: number;
  tags: CoverageTagSummary[];
  createdAt: string;
  updatedAt: string;
};

export type SnapshotTaskView = {
  taskId: string;
  buildHash: string;
  status: string;
  tagFilter: unknown;
  error: string | null;
  snapshotId: string | null;
  coverage: Record<string, { path: string; s: Record<string, number>; buildHash: string }> | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type SnapshotTaskSummary = {
  taskId: string;
  buildHash: string;
  status: string;
  tagFilter: unknown;
  snapshotId: string | null;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : `请求失败 (${res.status})`;
    const err = new Error(message) as Error & { status?: number; body?: unknown };
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export function fetchCoverageBuilds() {
  return request<{ items: CoverageBuild[] }>("/coverage/builds");
}

export function createSnapshot(buildHash: string, tag?: Record<string, string>) {
  return request<{ taskId: string; status: string }>("/coverage/snapshot", {
    method: "POST",
    body: JSON.stringify(tag ? { buildHash, tag } : { buildHash }),
  });
}

export function fetchSnapshotTask(taskId: string) {
  return request<SnapshotTaskView>(`/coverage/snapshot/tasks/${taskId}`);
}

export function fetchSnapshotTasksByBuild(buildHash: string) {
  return request<{ items: SnapshotTaskSummary[] }>(
    `/coverage/builds/${encodeURIComponent(buildHash)}/snapshot-tasks`,
  );
}
