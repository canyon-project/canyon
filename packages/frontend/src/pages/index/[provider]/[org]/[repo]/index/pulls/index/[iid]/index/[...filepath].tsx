import CoverageFileDrawer from '@/components/CoverageFileDrawer';
import { useOutletContext, useParams } from 'react-router-dom';

const FilePath = () => {
  const { repo, pull } = useOutletContext<any>();
  const params = useParams();
  const basePath = `/${params.provider}/${params.org}/${params.repo}/pulls/${pull?.iid}`;
  const initialPath = (params['*'] as string | undefined)?.replace('-/','');

  return (
    <CoverageFileDrawer
      repo={repo}
      subject={'pull'}
      subjectID={String(pull?.iid || '')}
      basePath={basePath}
      initialPath={initialPath}
      title={`${params.repo} !${pull?.iid} PR 详情覆盖率`}
    />
  );
};

export default FilePath;


