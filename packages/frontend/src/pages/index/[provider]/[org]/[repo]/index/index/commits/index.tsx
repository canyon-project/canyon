import CommitsList
  from "./views/CommitsList";
import {Outlet, useNavigate, useOutletContext, useParams, useSearchParams} from "react-router-dom";
import {useState} from "react";
import {useRequest} from "ahooks";
import axios from "axios";

const Commits = () => {
  const { repo } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const [selectedCommit, setSelectedCommit] = useState({
    sha: searchParams.get('sha'),
  });

  const [selectedBuildID, setSelectedBuildID] = useState(
    searchParams.get('build_id'),
  );

  console.log(selectedBuildID, 'selectedBuildID', searchParams.get('build_id'));

  // 获取仓库commits覆盖率上报记录通过仓库ID /repo/{repositoryId}/commits getRepoCommitsByRepoId
  // 获取仓库commits详细信息通过仓库ID /repo/{repositoryId}/commits/{commitId} getRepoCommitByCommitSHA
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

    // nav
    navigate(`/${params.provider}/${params.org}/${params.repo}/commits/${commit.sha}/-/`)

    // 获取当前参数
  };

  return <div className={'flex gap-[20px] px-[20px]'}>
    <CommitsList
      commits={data || []}
      onCommitSelect={handleCommitSelect}
      selectedCommit={selectedCommit}
    />
    <Outlet context={{
      repo,
      commit:selectedCommit
    }}/>
  </div>
}

export default Commits
