import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

/**
 * 获取报告页面的路由参数和查询参数
 */
export const useReportParams = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();

  const subjectID = params.subjectID;
  const subject = params.subject as
    | 'commit'
    | 'commits'
    | 'analysis'
    | 'analyses'
    | 'multiple-commits'
    | undefined;
  const provider = params.provider as string;
  const org = params.org as string;
  const repo = params.repo as string;

  // 将 subject 映射为后端接口需要的格式
  const subjectForQuery = useMemo((): 'commit' | 'analysis' => {
    if (subject === 'analysis' || subject === 'analyses') {
      return 'analysis';
    }
    return 'commit';
  }, [subject]);

  // 路由参数
  const routeParams = useMemo(
    () => ({
      provider,
      org,
      repo,
      subject,
      subjectID,
    }),
    [provider, org, repo, subject, subjectID],
  );

  // 查询参数
  const queryParams = useMemo(
    () => ({
      buildTarget: searchParams.get('build_target') || '',
      reportID: searchParams.get('report_id') || '',
      reportProvider: searchParams.get('report_provider') || '',
      scene: searchParams.get('scene') || '',
    }),
    [searchParams],
  );

  // 当前激活的路径
  const activatedPath = useMemo(
    () => params['*']?.replace('-/', '') || '',
    [params['*']],
  );

  return {
    routeParams,
    queryParams,
    subjectForQuery,
    activatedPath,
  };
};
