import { useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import CoverageFileDrawer from '@/components/CoverageFileDrawer';
const FilePath = () => {

  const {repo,commit} = useOutletContext<any>()
  const [searchParams] = useSearchParams();
  // const params = useParams();


  // const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate();
  const params = useParams();
  const basePath = `/${params.provider}/${params.org}/${params.repo}/commits/${commit.sha}`;


  const sha = params.sha
  // 保留查询参数，用于拼接 basePath 使 URL 状态可分享
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  const initialPath = (params['*'] as string | undefined)?.replace('-/','');

  return (
    <CoverageFileDrawer
      repo={repo}
      subject={'commit'}
      subjectID={sha || ''}
      basePath={`${basePath}?build_provider=${buildProvider}&build_id=${buildID}`}
      initialPath={initialPath}
      title={`${params.repo} Commit 详情覆盖率`}
    />
  );
};

export default FilePath;
