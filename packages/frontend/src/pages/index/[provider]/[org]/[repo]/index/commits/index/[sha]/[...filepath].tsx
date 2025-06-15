import {useNavigate, useOutletContext, useParams, useSearchParams} from "react-router-dom";
import {useRequest} from "ahooks";
import axios from "axios";

const Sha = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {commit,repo} = useOutletContext()

  const repoID = encodeURIComponent(params.org + '/' + params.repo);
  const { data, loading } = useRequest(
    () => {
      return axios
        .get(`/api/repo/${repoID}/commits/${params.sha}`)
        .then((res) => res.data);
    },
    {
      refreshDeps: [],
      onSuccess(v) {
        console.log(v,'???')
        // onBuildIDChange(v[0]);
      },
    },
  );

  return <div>
    {
      JSON.stringify(commit)
    }
    <br/>
    {
      JSON.stringify(repo)
    }
    <br/>
    {
      JSON.stringify(params)
    }
  </div>
}

export default Sha
