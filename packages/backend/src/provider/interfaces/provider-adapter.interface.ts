/**
 * Provider 适配器接口
 * 用于统一不同 Git Provider (GitLab, GitHub) 的 API 调用
 */
export interface IProviderAdapter {
  /**
   * 比较两个 commit 之间的差异
   * @param projectId 项目 ID
   * @param from 起始 commit SHA
   * @param to 目标 commit SHA
   * @returns 比较结果
   */
  compareCommits(
    projectId: string,
    from: string,
    to: string,
  ): Promise<any>;

  /**
   * 获取仓库信息
   * @param projectId 项目 ID
   * @returns 仓库信息
   */
  getRepository(projectId: string): Promise<any>;
}
