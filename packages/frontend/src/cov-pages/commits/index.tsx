import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import axios from 'axios';
import CommitsList from '../../components/CommitsList';
import Layout from '../../components/Layout';

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

const CommitsCovPage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  const { data: commits, loading } = useRequest(() => {
    const { provider, org, repo } = params;
    const repoId = `${org}/${repo}`;
    
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
      const sha = searchParams.get('sha');
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
    <Layout>
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
              <h2 className="text-lg font-semibold mb-4">Commit Details</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600">SHA:</span>
                    <p className="font-mono text-sm">{selectedCommit.sha}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Author:</span>
                    <p>{selectedCommit.author}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Message:</span>
                  <p className="mt-1">{selectedCommit.commitMessage}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600">Timestamp:</span>
                    <p>{new Date(selectedCommit.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Pipeline Count:</span>
                    <p>{selectedCommit.pipelineCount}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <p className="capitalize">{selectedCommit.aggregationStatus}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
              <p>Select a commit to view details</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CommitsCovPage;
