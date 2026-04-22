export interface CoverageMapInitMessage {
  id: string;
  buildHash: string;
  sceneKey: string;
  provider: string;
  repoID: string;
  sha: string;
  buildTarget: string;
  instrumentCwd: string;
  coverageFileCount: number;
  mapItemCount: number;
  relationItemCount: number;
  hitEntityCount: number;
  sourceMapItemCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 默认 coverage map init 事件生产者：
 * 当前仅打印消息；企业版可覆盖此文件，接入公司消息队列。
 */
export async function publishCoverageMapInitMessage(payload: CoverageMapInitMessage): Promise<void> {
  console.info("[coverage:map:init:producer] message", payload);
}
