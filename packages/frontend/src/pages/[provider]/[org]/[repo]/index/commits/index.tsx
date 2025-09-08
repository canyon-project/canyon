import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import {
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { RepoCommitsDocument } from '@/helpers/backend/gen/graphql.ts';
import CommitsList from './views/CommitsList.tsx';

const Commits = () => {
  const { repo } = useOutletContext<{ repo: { id: string } }>();
  const navigate = useNavigate();
  const params = useParams();

  type UICommit = {
    id: string;
    sha: string;
    commitMessage: string;
    author: string;
    timestamp: string;
    pipelineCount: number;
    aggregationStatus: string;
    hasE2E?: boolean;
    hasUnitTest?: boolean;
    branches: string[];
  };

  const [selectedCommit, setSelectedCommit] = useState<UICommit | null>(null);

  const { data } = useQuery(RepoCommitsDocument, {
    variables: {
      repoID: repo.id,
    },
  });

  const commits = useMemo(() => {
    const list = data?.repoCommits?.commits || [];
    return list.map(
      (item: {
        sha: string;
        lastCoverageCreatedAt?: string;
        commitMessage: string;
        branches?: string[];
      }): UICommit => {
        return {
          id: item.sha,
          sha: item.sha,
          commitMessage: item.commitMessage,
          author: '',
          timestamp: item.lastCoverageCreatedAt || '',
          pipelineCount: 1,
          aggregationStatus: 'completed',
          hasE2E: false,
          hasUnitTest: false,
          branches: item.branches || [],
        };
      },
    );
  }, [data]);

  useEffect(() => {
    if (params.sha) {
      const commit = commits.find((c) => c.sha === params.sha);
      if (commit) {
        setSelectedCommit(commit);
      }
    }
  }, [params.sha, commits]);

  const handleCommitSelect = (commit: UICommit) => {
    setSelectedCommit(commit);

    // nav
    navigate(
      `/${params.provider}/${params.org}/${params.repo}/commits/${commit.sha}`,
    );
  };

  return (
    <div className={'flex gap-[20px] px-[20px]'}>
      <CommitsList
        commits={commits || []}
        onCommitSelect={handleCommitSelect}
        selectedCommit={selectedCommit}
      />
      <Outlet
        context={{
          repo,
          commit: selectedCommit,
        }}
      />
    </div>
  );
};

export default Commits;
