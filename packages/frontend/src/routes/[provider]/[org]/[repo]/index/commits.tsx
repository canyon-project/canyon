// import CommitsPage from "@/pages/CommitsPage";

import CommitsPage from "@/pages/CommitsPage";
import {useSearchParams} from "react-router-dom";

const CommitsRoute = () => {
  // Parse query parameters
  const [urlSearchParams,
  setUrlSearchParams
  ] = useSearchParams()
  const sha = urlSearchParams.get("sha")
  const repoID = urlSearchParams.get("repo_id")
  const reportID = urlSearchParams.get("report_id")
  const reportProvider = urlSearchParams.get("report_provider")
  const showCoverageDrawer = urlSearchParams.get("show_coverage_drawer")


  function onSelectCommit(shaValue) {
    urlSearchParams.set("sha", shaValue)
    setUrlSearchParams(urlSearchParams)
  }

  return <div>
    <CommitsPage sha={sha} repoID={repoID} reportID={reportID} reportProvider={reportProvider} onSelectCommit={onSelectCommit} showCoverageDrawer={showCoverageDrawer}/>
  </div>;
};

export default CommitsRoute;




