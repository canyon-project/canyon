import CommitsList from './CommitsList';
import { useState } from 'react';
import CommitsDetail from './CommitsDetail';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import axios from 'axios';
// import { useQuery } from "@apollo/client";
// import { GetProjectCommitsDocument } from "@/graphql/gen/graphql.ts";

const CommitsTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  // 测试url http://localhost:8000/coverage?sha=e5f02368eaf5027c756f4c9f33d60f89c67f348b&build_provider=gitlab_runner&build_id=121974026&repo_id=106573&provider=gitlab&report_id=initial_coverage_data&report_provider=person&file_path=
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

    // 获取当前参数
    const params = new URLSearchParams(searchParams);
    params.set('sha', commit.sha);
    setSearchParams(params);

    // 重置选中的 Build ID，默认选择第一个
    // setSelectedBuildID(null);
    // handleBuildIDSelect();
  };

  // function handleBuildIDSelect() {
  //   console.log(data)
  //   selectedBuildID(data[0].buildID);
  //   // 获取当前参数
  //   const params = new URLSearchParams(searchParams);
  //   params.set('build_id', data[0].buildID);
  //   setSearchParams(params);
  // }

  if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;

  return (
    // NOTE：这里需要注意，暂时用条件判断渲染，后续改成路由？
    <div className={'flex gap-[20px] px-[20px]'}>
      <CommitsList
        commits={data || []}
        onCommitSelect={handleCommitSelect}
        selectedCommit={selectedCommit}
      />
      <CommitsDetail
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
