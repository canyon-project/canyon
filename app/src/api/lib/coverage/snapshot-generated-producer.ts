export interface SnapshotGeneratedMessage {
  snapshotID: number;
  provider: string;
  repoID: string;
  subject: string;
  subjectID: string;
  status: "completed";
  buildHash: string;
  artifactSize: number;
  durationMs: number | null;
  createdBy: string;
  createdAt: string;
  freezeTime: string;
  finishedAt: string;
  buildTarget: string;
  statementsCovered: number | null;
  statementsTotal: number | null;
  functionsCovered: number | null;
  functionsTotal: number | null;
  branchesCovered: number | null;
  branchesTotal: number | null;
  changestatementsCovered: number | null;
  changestatementsTotal: number | null;
  changefunctionsCovered: number | null;
  changefunctionsTotal: number | null;
  changebranchesCovered: number | null;
  changebranchesTotal: number | null;
}

/**
 * 默认快照完成事件生产者：
 * 目前仅打印消息；企业版可覆盖此文件，接入公司消息队列。
 */
export async function publishSnapshotGeneratedMessage(
  payload: SnapshotGeneratedMessage,
): Promise<void> {
  console.info("[snapshot:generated:producer] message", payload);
}
