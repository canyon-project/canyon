/** Git ref 不允许包含 `~`，但允许 `/`。用 `~` 替换 `/`，保证 subjectID 可作为单段 URL path。 */
const REF_SLASH_PLACEHOLDER = "~";

export const FULL_SHA_RE = /^[a-f0-9]{40}$/i;
export const MR_IID_RE = /^\d+$/;

export type CompareRefKind = "sha" | "branch";
export type CompareMode = "commits" | "refs" | "mr";

export type CompareSpec = {
  mode: CompareMode;
  live: boolean;
  baseKind: CompareRefKind;
  headKind: CompareRefKind;
  baseRef: string;
  headRef: string;
  mrIid?: string;
};

export const COMPARE_PLACEHOLDER_PATH = "__canyon_compare__";

export function isFullSha(value: string): boolean {
  return FULL_SHA_RE.test(value.trim());
}

export function encodeCompareRef(ref: string): string {
  return encodeURIComponent(ref.trim().replaceAll("/", REF_SLASH_PLACEHOLDER));
}

export function decodeCompareRef(encoded: string): string {
  return decodeURIComponent(encoded).replaceAll(REF_SLASH_PLACEHOLDER, "/");
}

export function normalizeMrIid(raw: string): string {
  return raw.trim().replace(/^!/, "");
}

export function isLiveCompare(spec: Pick<CompareSpec, "mode" | "baseKind" | "headKind">): boolean {
  return spec.mode === "mr" || spec.baseKind === "branch" || spec.headKind === "branch";
}

function inferKind(ref: string, explicit?: CompareRefKind): CompareRefKind {
  if (explicit) return explicit;
  return isFullSha(ref) ? "sha" : "branch";
}

export function buildCompareSpec(input: {
  subjectID?: string;
  mode?: "commits" | "commit_branch" | "branches" | "mr" | CompareMode;
  baseKind?: CompareRefKind;
  headKind?: CompareRefKind;
  baseRef?: string;
  headRef?: string;
  mrIid?: string;
}): CompareSpec {
  const mrIid = input.mrIid ? normalizeMrIid(input.mrIid) : undefined;
  if (input.mode === "mr" || mrIid) {
    if (!mrIid || !MR_IID_RE.test(mrIid)) {
      throw new Error("MR IID 格式错误，应为纯数字");
    }
    return {
      mode: "mr",
      live: true,
      baseKind: "branch",
      headKind: "branch",
      baseRef: "",
      headRef: "",
      mrIid,
    };
  }

  if (input.baseRef && input.headRef) {
    const baseRef = input.baseRef.trim();
    const headRef = input.headRef.trim();
    if (!baseRef || !headRef) {
      throw new Error("base 与 head 不能为空");
    }
    const baseKind = inferKind(baseRef, input.baseKind);
    const headKind = inferKind(headRef, input.headKind);
    if (baseKind === "sha" && !isFullSha(baseRef)) {
      throw new Error("Base Commit SHA 格式不正确（应为 40 位十六进制）");
    }
    if (headKind === "sha" && !isFullSha(headRef)) {
      throw new Error("Head Commit SHA 格式不正确（应为 40 位十六进制）");
    }
    const mode: CompareMode = baseKind === "sha" && headKind === "sha" ? "commits" : "refs";
    return {
      mode,
      live: isLiveCompare({ mode, baseKind, headKind }),
      baseKind,
      headKind,
      baseRef,
      headRef,
    };
  }

  if (input.subjectID) {
    return parseCompareSubjectID(input.subjectID);
  }

  throw new Error("请提供 base/head，或 MR IID");
}

export function serializeCompareSubjectID(spec: CompareSpec): string {
  if (spec.mode === "mr") {
    if (!spec.mrIid) throw new Error("MR compare 缺少 iid");
    return `mr:${spec.mrIid}`;
  }
  if (spec.baseKind === "sha" && spec.headKind === "sha") {
    return `${spec.baseRef}...${spec.headRef}`;
  }
  return `${spec.baseKind}:${encodeCompareRef(spec.baseRef)}...${spec.headKind}:${encodeCompareRef(spec.headRef)}`;
}

function parseSide(raw: string): { kind: CompareRefKind; ref: string } {
  if (raw.startsWith("sha:")) {
    return { kind: "sha", ref: decodeCompareRef(raw.slice(4)) };
  }
  if (raw.startsWith("branch:")) {
    return { kind: "branch", ref: decodeCompareRef(raw.slice(7)) };
  }
  if (isFullSha(raw)) {
    return { kind: "sha", ref: raw };
  }
  return { kind: "branch", ref: decodeCompareRef(raw) };
}

export function parseCompareSubjectID(subjectID: string): CompareSpec {
  const id = subjectID.trim();
  if (!id) {
    throw new Error("subjectID 不能为空");
  }

  if (id.startsWith("mr:")) {
    const mrIid = normalizeMrIid(id.slice(3));
    if (!MR_IID_RE.test(mrIid)) {
      throw new Error("subjectID 格式错误，MR IID 应为纯数字");
    }
    return {
      mode: "mr",
      live: true,
      baseKind: "branch",
      headKind: "branch",
      baseRef: "",
      headRef: "",
      mrIid,
    };
  }

  const parts = id.split("...");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("subjectID 格式错误，应为 base...head 或 mr:{iid}");
  }

  const base = parseSide(parts[0]);
  const head = parseSide(parts[1]);
  const mode: CompareMode = base.kind === "sha" && head.kind === "sha" ? "commits" : "refs";
  return {
    mode,
    live: isLiveCompare({ mode, baseKind: base.kind, headKind: head.kind }),
    baseKind: base.kind,
    headKind: head.kind,
    baseRef: base.ref,
    headRef: head.ref,
  };
}
