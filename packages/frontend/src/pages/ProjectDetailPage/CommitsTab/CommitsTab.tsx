import CommitsList from './CommitsList';
import { useState } from 'react';
import CommitsDetail from './CommitsDetail';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import axios from 'axios';

const CommitsTab = ({repo}) => {
  const [searchParams, setSearchParams] = useSearchParams();
const [selectedCommit, setSelectedCommit] = useState({
    sha: searchParams.get('sha'),
  });

  const [selectedBuildID, setSelectedBuildID] = useState(
    searchParams.get('build_id'),
  );

  console.log(selectedBuildID, 'selectedBuildID', searchParams.get('build_id'));

  // 获取仓库commits覆盖率上报记录通过仓库ID /repo/{repositoryId}/commits getRepoCommitsByRepoId
  // 获取仓库commits详细信息通过仓库ID /repo/{repositoryId}/commits/{commitId} getRepoCommitByCommitSHA
  const params = useParams();
  console.log(params, 'params');
  const { data, loading } = useRequest(() => {
    return axios
      .get(`/api/repo/${repo.id}/commits`)
      .then((res) => res.data)
      .then((res) => {
        return res.map((item) => {
          return {
            id: item.sha,
            sha: item.sha,
            commitMessage: item.commitDetail.message,
            author: item.commitDetail.author_name,
            timestamp: item.commitDetail.authored_date,
            pipelineCount: 3,
            aggregationStatus: 1,
            hasE2E: false,
            hasUnitTest: false,
            branches: ['dev'], // 新增属性，存储 commit 所在的分支
          };
        });
      });
  });

  const handleCommitSelect = (commit) => {
    setSelectedCommit(commit);

    // 获取当前参数
    const params = new URLSearchParams(searchParams);
    params.set('sha', commit.sha);
    setSearchParams(params);
  };
  if (loading) return <div>Loading...</div>;

  return (
    // NOTE：这里需要注意，暂时用条件判断渲染，后续改成路由？
    <div className={'flex gap-[20px] px-[20px]'}>
      <CommitsList
        commits={data || []}
        onCommitSelect={handleCommitSelect}
        selectedCommit={selectedCommit}
      />
      <CommitsDetail
        repo={repo}
        selectedCommit={selectedCommit}
        selectedBuildID={selectedBuildID}
        onBuildIDChange={(buildID) => {
          setSelectedBuildID(buildID);
          // 获取当前参数
          const params = new URLSearchParams(searchParams);
          params.set('build_id', buildID);
          setSearchParams(params);
        }}
      />
    </div>
  );
};

export default CommitsTab;
