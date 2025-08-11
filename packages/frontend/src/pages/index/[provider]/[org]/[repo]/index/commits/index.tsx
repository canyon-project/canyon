import CommitsList
  from "./views/CommitsList.tsx";
import {Outlet, useNavigate, useOutletContext, useParams, useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {useRequest} from "ahooks";
import axios from "axios";

const Commits = () => {
  const { repo } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const [selectedCommit, setSelectedCommit] = useState({
    sha: null,
  });

  const [selectedBuildID, setSelectedBuildID] = useState(
    searchParams.get('build_id'),
  );

  const { data, loading } = useRequest(() => {
    return axios
      .get(`/api/repo/${repo.id}/commits`)
      .then((res) => res.data)
      .then((res) => {
        // 将后端返回的 commits 转换为前端列表所需结构；
        // 后端字段：sha, branch, compareTarget, provider, createdAt, latestId
        return (res.commits || []).map((item) => {
          const sha = item.sha;
          return {
            id: sha,
            sha: sha,
            // 使用后端返回的真实字段
            commitMessage: item.message || '',
            author: item.author_name || '',
            timestamp: item.createdAt || new Date().toISOString(),
            // 临时：其余字段先保留默认
            pipelineCount: 1,
            aggregationStatus: 'completed',
            hasE2E: false,
            hasUnitTest: false,
            branches: item.branch ? [item.branch] : ['dev'],
          };
        });
      });
  },{
    onSuccess: (commits) => {
    //   如果有选中的 commit，则设置为 selectedCommit
      if (params.sha){
        const commit = commits.find(c => c.sha === params.sha);
        if (commit) {
          setSelectedCommit(commit);
        }
      }
    }
  });

  const handleCommitSelect = (commit) => {
    setSelectedCommit(commit);

    // nav
    navigate(`/${params.provider}/${params.org}/${params.repo}/commits/${commit.sha}`)

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
