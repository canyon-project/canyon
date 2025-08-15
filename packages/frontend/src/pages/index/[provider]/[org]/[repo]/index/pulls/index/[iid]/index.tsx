import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import PullCoverageOverview from './views/PullCoverageOverview';

const PullDetail = () => {
  const { repo, pull } = useOutletContext<any>();
  const params = useParams();

  if (!pull || String(pull.iid) !== params.iid) {
    return <div className={'p-4 text-gray-500 text-sm'}>请选择左侧的 Pull Request</div>;
  }

  return (
    <div className={'flex-1 p-4'}>
      <div className='mb-3'>
        <div className='font-medium text-lg'>
          !{pull.iid} {pull.title}
        </div>
        <div className='mt-1 text-gray-500 text-xs'>
          {pull.sourceBranch} → {pull.targetBranch}
          <span className='ml-2'>状态：{pull.state}</span>
          <span className='ml-2'>作者：{pull.author || '-'}</span>
        </div>
      </div>
      <PullCoverageOverview />
      <Outlet context={{ repo, pull }} />
    </div>
  );
};

export default PullDetail;
