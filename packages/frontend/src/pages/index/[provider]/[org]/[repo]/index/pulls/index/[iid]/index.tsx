import {useOutletContext, useParams} from 'react-router-dom';

const PullDetail = () => {
  const { pull } = useOutletContext<any>();
  const params = useParams();

  if (!pull || String(pull.iid) !== params.iid) {
    return <div className={'p-4 text-sm text-gray-500'}>请选择左侧的 Pull Request</div>;
  }

  return (
    <div className={'flex-1 p-4'}>
      <div className="text-lg font-medium">!{pull.iid} {pull.title}</div>
      <div className="text-xs text-gray-500 mt-2">
        {pull.sourceBranch} → {pull.targetBranch}
      </div>
      <div className="text-xs text-gray-500 mt-1">状态：{pull.state}</div>
      <div className="text-xs text-gray-500 mt-1">作者：{pull.author || '-'}</div>
      {/* 可在此处继续加入覆盖率概览、变更文件等面板 */}
    </div>
  );
};

export default PullDetail;


