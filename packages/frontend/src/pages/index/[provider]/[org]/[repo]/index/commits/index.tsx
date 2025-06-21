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
