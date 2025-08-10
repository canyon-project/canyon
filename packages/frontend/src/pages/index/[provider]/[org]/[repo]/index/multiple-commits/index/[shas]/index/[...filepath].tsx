import CoverageFileDrawer from '@/components/CoverageFileDrawer';
import { useOutletContext, useParams } from 'react-router-dom';

const FilePath = () => {
  const { repo } = useOutletContext<any>();
  const params = useParams();

  const shas = (params.shas || '').toString();
  const basePath = `/${params.provider}/${params.org}/${params.repo}/multiple-commits/${params.shas}`;
  const initialPath = (params['*'] as string | undefined)?.replace('-/','');

  return (
    <CoverageFileDrawer
      repo={repo}
      subject={'multiple-commits'}
      subjectID={shas}
      basePath={basePath}
      initialPath={initialPath}
      title={`${params.repo} Multiple Commits 详情覆盖率`}
    />
  );
};

export default FilePath;


