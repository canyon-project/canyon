import CommitsList from './CommitsList';
import { useState } from 'react';
import CommitsDetail from './CommitsDetail';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import axios from 'axios';
// import { useQuery } from "@apollo/client";
// import { GetProjectCommitsDocument } from "@/graphql/gen/graphql.ts";

const CommitsTab = () => {
  // const params = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedCommit, setSelectedCommit] = useState(null);

  // 获取仓库commits覆盖率上报记录通过仓库ID /repo/{repositoryId}/commits getRepoCommitsByRepoId
  // 获取仓库commits详细信息通过仓库ID /repo/{repositoryId}/commits/{commitId} getRepoCommitByCommitSHA
  const params = useParams();
  console.log(params, 'params');
  const repoID = encodeURIComponent(params.org + '/' + params.repo);
  const { data, loading } = useRequest(() => {
    return axios
      .get(`/api/repo/${repoID}/commits`)
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
  };

  if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={'flex gap-[20px] px-[20px]'}>
      <CommitsList
        commits={data || []}
        onCommitSelect={handleCommitSelect}
        selectedCommit={selectedCommit}
      />
      <CommitsDetail selectedCommit={selectedCommit} />
    </div>
  );
};

export default CommitsTab;
