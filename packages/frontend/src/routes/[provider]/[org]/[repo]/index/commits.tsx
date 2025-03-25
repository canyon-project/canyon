// import CommitsPage from "@/pages/CommitsPage";

import CommitsPage from "@/pages/CommitsPage";
import {useSearchParams} from "react-router-dom";

const CommitsRoute = () => {
  // Parse query parameters
  const [urlSearchParams] = useSearchParams()
  const sha = urlSearchParams.get("sha")
  const repoID = urlSearchParams.get("repo_id")
  const reportID = urlSearchParams.get("report_id")
  const reportProvider = urlSearchParams.get("report_provider")
  return <div>
    <CommitsPage sha={sha} repoID={repoID} reportID={reportID} reportProvider={reportProvider}/>
  </div>;
};

export default CommitsRoute;




