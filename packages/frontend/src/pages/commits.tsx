import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import axios from 'axios';
import CommitsList from '../components/CommitsList';

interface Commit {
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
}

const Commits = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  const { data: commits, loading } = useRequest(() => {
    const { provider, org, repo } = params;
    const repoId = `${provider}/${org}/${repo}`;
    
    return axios
      .get(`/api/v1/repo/${encodeURIComponent(repoId)}/commits`)
      .then((res) => res.data)
      .then((res) => {
        return res.map((item: any) => ({
          id: item.sha,
          sha: item.sha,
          commitMessage: item.commitDetail?.message || 'No message',
          author: item.commitDetail?.author_name || 'Unknown',
          timestamp: item.commitDetail?.authored_date || new Date().toISOString(),
          pipelineCount: item.coverageDetail?.length || 0,
          aggregationStatus: item.coverageDetail?.length > 0 ? 'completed' : 'pending',
          hasE2E: false,
          hasUnitTest: false,
          branches: ['main'],
        }));
      });
  }, {
    onSuccess: (commitList) => {
      const sha = params.sha;
      if (sha && commitList) {
        const commit = commitList.find((c: Commit) => c.sha === sha);
        if (commit) {
          setSelectedCommit(commit);
        }
      }
    }
  });

  const handleCommitSelect = (commit: Commit) => {
    setSelectedCommit(commit);
    const { provider, org, repo } = params;
    navigate(`/${provider}/${org}/${repo}/commits/${commit.sha}`);
  };

  return (
    <div className="flex gap-5 px-5 h-full">
      <CommitsList
        commits={commits || []}
        onCommitSelect={handleCommitSelect}
        selectedCommit={selectedCommit}
        loading={loading}
      />
      <div className="flex-1">
        {selectedCommit ? (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Commit Details</h2>
            <div className="space-y-2">
              <p><strong>SHA:</strong> {selectedCommit.sha}</p>
              <p><strong>Message:</strong> {selectedCommit.commitMessage}</p>
              <p><strong>Author:</strong> {selectedCommit.author}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedCommit.timestamp).toLocaleString()}</p>
              <p><strong>Pipeline Count:</strong> {selectedCommit.pipelineCount}</p>
              <p><strong>Status:</strong> {selectedCommit.aggregationStatus}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Select a commit to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default Commits;