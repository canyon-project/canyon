export type CoverageSubject = "commit" | "compare" | "pull" | "merge_requests";

export type CompareCreateBody = {
  repoID: string;
  provider: string;
  subject?: string;
  subjectID?: string;
  mode?: "commits" | "commit_branch" | "branches" | "mr";
  baseKind?: "sha" | "branch";
  headKind?: "sha" | "branch";
  baseRef?: string;
  headRef?: string;
  mrIid?: string;
  refresh?: boolean;
};

export type CoverageSummaryEntry = {
  path?: string;
  change?: boolean;
  statements?: { total: number; covered: number; pct: number };
  changestatements?: { total: number; covered: number; pct: number };
  newlines?: { total: number; covered: number; pct: number };
  lines?: { total: number; covered: number; pct: number };
};

export type CoverageSummaryMap = Record<string, CoverageSummaryEntry>;

export type CompareRecord = {
  subjectID: string;
  subject: string;
  from: string;
  to: string;
  base?: string;
  head?: string;
  files?: Array<{ path: string; additions: number[]; deletions: number[] }>;
  createdAt?: string;
};

export type SnapshotRecord = {
  id: number;
  provider: string;
  repoID: string;
  subject: string;
  subjectID: string;
  status: string;
  title: string | null;
  changestatementsCovered: number | null;
  changestatementsTotal: number | null;
  statementsCovered: number | null;
  statementsTotal: number | null;
  createdAt: string;
};

export type RepoRecord = {
  id: string;
  pathWithNamespace: string;
  description?: string;
};

function trimBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export class CanyonClient {
  readonly baseUrl: string;
  readonly token: string | undefined;

  constructor(options?: { baseUrl?: string; token?: string }) {
    this.baseUrl = trimBaseUrl(
      options?.baseUrl || process.env["CANYON_URL"] || "http://127.0.0.1:3000",
    );
    this.token = options?.token || process.env["CANYON_TOKEN"];
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.headers(),
        ...(init?.headers || {}),
      },
    });

    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!res.ok) {
      const message =
        typeof body === "object" &&
        body &&
        ("error" in body || "message" in body)
          ? String((body as { error?: string; message?: string }).error || (body as { message?: string }).message)
          : `HTTP ${res.status}`;
      throw new Error(message);
    }

    return body as T;
  }

  health(): Promise<string> {
    return this.request<string>("/api/health");
  }

  listRepos(search?: string): Promise<RepoRecord[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request<RepoRecord[]>(`/api/repos${qs}`);
  }

  getCoverageSummary(args: {
    provider: string;
    repoID: string;
    subject: CoverageSubject;
    subjectID: string;
    buildTarget?: string;
    scene?: string;
  }): Promise<CoverageSummaryMap> {
    const params = new URLSearchParams({
      provider: args.provider,
      repoID: args.repoID,
      subject: args.subject,
      subjectID: args.subjectID,
    });
    if (args.buildTarget) params.set("buildTarget", args.buildTarget);
    if (args.scene) params.set("scene", args.scene);
    return this.request<CoverageSummaryMap>(`/api/coverage/summary/map?${params}`);
  }

  listCompares(args: {
    provider: string;
    repoID: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: CompareRecord[]; total: number }> {
    const params = new URLSearchParams({
      provider: args.provider,
      repoID: args.repoID,
      page: String(args.page ?? 1),
      pageSize: String(args.pageSize ?? 20),
    });
    return this.request<{ data: CompareRecord[]; total: number }>(`/api/source/diff?${params}`);
  }

  createCompare(body: CompareCreateBody): Promise<{
    subjectID: string;
    from: string;
    to: string;
    files: Array<{ path: string; additions: number[]; deletions: number[] }>;
  }> {
    return this.request(`/api/source/diff`, {
      method: "POST",
      body: JSON.stringify({ subject: "compare", ...body }),
    });
  }

  listSnapshots(args: {
    provider?: string;
    repoID?: string;
    subject?: "commit" | "compare";
    page?: number;
    pageSize?: number;
  }): Promise<{ data: SnapshotRecord[]; total: number }> {
    const params = new URLSearchParams();
    if (args.provider) params.set("provider", args.provider);
    if (args.repoID) params.set("repoID", args.repoID);
    if (args.subject) params.set("subject", args.subject);
    params.set("page", String(args.page ?? 1));
    params.set("pageSize", String(args.pageSize ?? 20));
    return this.request<{ data: SnapshotRecord[]; total: number }>(
      `/api/coverage/snapshot?${params}`,
    );
  }
}
