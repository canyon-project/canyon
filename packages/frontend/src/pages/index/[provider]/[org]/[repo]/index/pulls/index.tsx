import {Outlet, useNavigate, useOutletContext, useParams} from "react-router-dom";
import {useRequest} from "ahooks";
import axios from "axios";
import {useState} from "react";
import PullsList from "./views/PullsList";

const Pulls = () => {
  const { repo } = useOutletContext<any>();
  const params = useParams();
  const navigate = useNavigate();

  const [selectedPull, setSelectedPull] = useState<any>(null);

  const { data } = useRequest(() => {
    return axios
      .get(`/api/repo/${repo.id}/pulls`)
      .then((res) => res.data)
      .then((res) => {
        const pulls = (res.pulls || []).map((mr: any) => ({
          id: `${mr.project_id}-${mr.iid}`,
          iid: mr.iid,
          title: mr.title,
          author: mr.author?.name,
          createdAt: mr.created_at,
          state: mr.state,
          webUrl: mr.web_url,
          sourceBranch: mr.source_branch,
          targetBranch: mr.target_branch,
        }));
        return pulls;
      });
  }, {
    onSuccess(pulls) {
      if (!selectedPull && pulls && pulls.length > 0) {
        setSelectedPull(pulls[0]);
      }
    }
  });

  const handlePullSelect = (pull: any) => {
    setSelectedPull(pull);
    // 如需跳详情，可在此导航，例如：
    // navigate(`/${params.provider}/${params.org}/${params.repo}/pulls/${pull.iid}`)
  };

  return (
    <div className={'flex gap-[20px] px-[20px]'}>
      <PullsList
        pulls={data || []}
        selectedPull={selectedPull}
        onPullSelect={handlePullSelect}
      />
      <Outlet context={{ repo, pull: selectedPull }} />
    </div>
  );
};

export default Pulls;


