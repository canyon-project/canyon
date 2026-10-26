/** 快照任务轮询结果 */
export type SnapshotDone = {
  status: string;
  coverage: Record<string, { path: string; s: Record<string, number>; buildHash: string }> | null;
  snapshotId: string | null;
  error: string | null;
};

export async function waitForSnapshotTask(
  baseUrl: string,
  taskId: string,
  timeoutMs = 10_000,
): Promise<SnapshotDone> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${baseUrl}/coverage/snapshot/tasks/${taskId}`);
    if (res.status !== 200) {
      throw new Error(`轮询快照任务失败: ${res.status}`);
    }
    const body = (await res.json()) as SnapshotDone;
    if (body.status === "succeeded" || body.status === "failed" || body.status === "rejected") {
      return body;
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`任务超时未完成: ${taskId}`);
}

export async function postCoverageClient(
  baseUrl: string,
  tag: Record<string, string>,
  coverage: Record<string, { path: string; s: Record<string, number>; buildHash: string }>,
): Promise<{ status: number; body: { buildHash: string; tagKey: string; hitCount: number } }> {
  const res = await fetch(`${baseUrl}/coverage/client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag, coverage }),
  });
  const body = (await res.json()) as { buildHash: string; tagKey: string; hitCount: number };
  return { status: res.status, body };
}

export async function createCoverageSnapshot(
  baseUrl: string,
  buildHash: string,
  tag?: Record<string, string>,
): Promise<{ status: number; taskId?: string; body: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}/coverage/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag ? { buildHash, tag } : { buildHash }),
  });
  const body = (await res.json()) as Record<string, unknown>;
  return { status: res.status, taskId: body.taskId as string | undefined, body };
}
