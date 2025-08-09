import {useOutletContext, useParams} from 'react-router-dom';
import PullCoverageOverview from './views/PullCoverageOverview';

const PullDetail = () => {
  const { pull } = useOutletContext<any>();
  const params = useParams();

  if (!pull || String(pull.iid) !== params.iid) {
    return <div className={'p-4 text-sm text-gray-500'}>请选择左侧的 Pull Request</div>;
  }

  return (
    <div className={'flex-1 p-4'}>
      <div className="mb-3">
        <div className="text-lg font-medium">!{pull.iid} {pull.title}</div>
        <div className="text-xs text-gray-500 mt-1">
          {pull.sourceBranch} → {pull.targetBranch}
          <span className="ml-2">状态：{pull.state}</span>
          <span className="ml-2">作者：{pull.author || '-'}</span>
        </div>
      </div>
      <PullCoverageOverview />
    </div>
  );
};

export default PullDetail;


