import {Outlet, useOutletContext, useSearchParams} from "react-router-dom";
import CommitCoverageOverview
  from "@/pages/index/[provider]/[org]/[repo]/index/commits/index/[sha]/views/CommitCoverageOverview.tsx";
import {useState} from "react";
import RIf from "@/components/RIf.tsx";

const Sha = () => {
  const {commit,repo} = useOutletContext()
  const [searchParams,setSearchParams] = useSearchParams()
  const [selectedBuildID, setSelectedBuildID] = useState(
    searchParams.get('build_id'),
  );
  const [selectedBuildProvider, setSelectedBuildProvider] = useState(
    searchParams.get('build_provider'),
  )


  function onChange({
    buildID,
    buildProvider,
                    }) {
    setSelectedBuildID(buildID);
    setSelectedBuildProvider(buildProvider);
    searchParams.set('build_id', buildID);
    searchParams.set('build_provider', buildProvider);

    setSearchParams(searchParams)
  }
  return <div className={'w-full shadow'}>
    <RIf condition={commit?.sha}>
      <CommitCoverageOverview commit={commit} repo={repo} onChange={onChange} selectedBuildID={selectedBuildID} />
    </RIf>
    <Outlet context={{
      commit: commit,
      repo: repo
    }}/>
  </div>
}

export default Sha;
