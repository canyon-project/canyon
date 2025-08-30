import { useState } from 'react';
import { Outlet, useOutletContext, useSearchParams } from 'react-router-dom';
import RIf from '@/components/RIf.tsx';
import CommitCoverageOverview from '@/pages/[provider]/[org]/[repo]/index/commits/index/[sha]/views/CommitCoverageOverview.tsx';

const Sha = () => {
  const { commit, repo } = useOutletContext<{
    commit?: import('@/types').Commit;
    repo?: import('@/types').Repository;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBuildID, setSelectedBuildID] = useState(
    searchParams.get('build_id'),
  );
  const [_selectedBuildProvider, setSelectedBuildProvider] = useState(
    searchParams.get('build_provider'),
  );

  function onChange({
    buildID,
    buildProvider,
  }: {
    buildID: string;
    buildProvider: string;
  }) {
    setSelectedBuildID(buildID);
    setSelectedBuildProvider(buildProvider);
    searchParams.set('build_id', buildID);
    searchParams.set('build_provider', buildProvider);

    setSearchParams(searchParams);
  }
  return (
    <div className={'w-full shadow'}>
      <RIf condition={Boolean(commit?.sha)}>
        <CommitCoverageOverview
          commit={commit}
          repo={repo}
          onChange={onChange}
          selectedBuildID={selectedBuildID}
        />
      </RIf>
      <Outlet
        context={{
          commit: commit,
          repo: repo,
        }}
      />
    </div>
  );
};

export default Sha;
