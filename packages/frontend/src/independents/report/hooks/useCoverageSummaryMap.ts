import { useRequest } from 'ahooks';
import axios from 'axios';
import { useMemo } from 'react';

interface UseCoverageSummaryMapParams {
  subjectForQuery: 'commit' | 'analysis';
  subjectID: string | undefined;
  buildTarget: string;
  repoID: string;
  provider: string;
  reportID: string;
  reportProvider: string;
  scene: string;
}

/**
 * 获取覆盖率摘要映射数据（只调用一次）
 */
export const useCoverageSummaryMap = (params: UseCoverageSummaryMapParams) => {
  const { data: mapData, loading } = useRequest(
    () =>
      axios('/api/coverage/summary/map', {
        params: {
          subject: params.subjectForQuery,
          subjectID: params.subjectID,
          buildTarget: params.buildTarget,
          repoID: params.repoID,
          provider: params.provider,
          reportID: params.reportID,
          reportProvider: params.reportProvider,
          scene: params.scene,
        },
      }).then(({ data }) => data),
    {
      refreshDeps: [
        params.subjectForQuery,
        params.subjectID,
        params.buildTarget,
        params.reportID,
        params.reportProvider,
        params.repoID,
        params.scene,
        params.provider,
      ],
      ready: !!params.repoID, // 只有当 repoID 存在时才请求
      // refreshDeps 控制何时重新请求，相同的参数组合只会调用一次
    },
  );

  // 将对象格式转换为数组格式，使用 useMemo 稳定引用
  const data = useMemo(
    () =>
      mapData
        ? Object.values(mapData).map((item: any) => ({
            ...item,
            path: item.path || '',
          }))
        : [],
    [mapData],
  );

  return {
    data,
    loading,
    mapData,
  };
};
