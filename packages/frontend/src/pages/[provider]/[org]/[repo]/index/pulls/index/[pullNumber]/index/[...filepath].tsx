import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import CoverageFileDrawer from '@/components/CoverageFileDrawer';

const FilePath = () => {
  const { repo } = useOutletContext<{
    repo: { id: string; pathWithNamespace: string };
  }>();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const basePath = `/${params.provider}/${params.org}/${params.repo}/pulls/${params.pullNumber}`;

  const pullNumber = params.pullNumber;
  // 保留查询参数，用于拼接 basePath 使 URL 状态可分享
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';
  const reportID = searchParams.get('report_id') || '';
  const initialPath = (params['*'] as string | undefined)?.replace('-/', '');

  return (
    <CoverageFileDrawer
      repo={repo}
      subject={'pulls'}
      subjectID={pullNumber || ''}
      basePath={`${basePath}?build_provider=${buildProvider}&build_id=${buildID}${reportProvider ? `&report_provider=${reportProvider}` : ''}${reportID ? `&report_id=${reportID}` : ''}`}
      initialPath={initialPath}
      title={`${params.repo} Commit 详情覆盖率`}
    />
  );
};

export default FilePath;
