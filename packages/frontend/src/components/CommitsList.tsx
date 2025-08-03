import { useState, useEffect } from 'react';
import { List, Badge, Spin, Input, Tooltip, Space } from 'antd';
import { SearchOutlined, TagsOutlined } from '@ant-design/icons';

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

interface CommitsListProps {
  commits: Commit[];
  selectedCommit: Commit | null;
  onCommitSelect: (commit: Commit) => void;
  loading?: boolean;
}

const CommitsList = ({
  commits,
  selectedCommit,
  onCommitSelect,
  loading = false,
}: CommitsListProps) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCommits, setFilteredCommits] = useState(commits);

  useEffect(() => {
    let filtered = commits;

    if (searchText) {
      filtered = filtered.filter(
        (commit) =>
          commit.sha.includes(searchText) ||
          commit.commitMessage.toLowerCase().includes(searchText.toLowerCase()) ||
          commit.author.toLowerCase().includes(searchText.toLowerCase()) ||
          commit.branches.some((branch) =>
            branch.toLowerCase().includes(searchText.toLowerCase()),
          ),
      );
    }

    setFilteredCommits(filtered);
  }, [searchText, commits]);

  const getBadgeStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'processing';
      case 'pending':
        return 'default';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTestTypeBadges = (commit: Commit) => {
    return (
      <div className="flex gap-1">
        {commit.hasE2E && (
          <Tooltip title="包含 E2E 测试">
            <Badge color="blue" className="scale-75" />
          </Tooltip>
        )}
        {commit.hasUnitTest && (
          <Tooltip title="包含单元测试">
            <Badge color="green" className="scale-75" />
          </Tooltip>
        )}
      </div>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}m ago`;
      }
      return `${diffInHours}h ago`;
    }
    return `${diffInDays}d ago`;
  };

  return (
    <div className="flex h-full flex-col shadow w-80 bg-white rounded-lg">
      <div className="p-3 border-b">
        <Input
          placeholder="Search commits"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="h-8 text-sm"
          allowClear
        />
      </div>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center p-4">
            <Spin size="small" />
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className="flex justify-center p-4">
            <span className="text-sm text-gray-500">
              {commits.length === 0 ? 'No commits found' : 'No matching commits'}
            </span>
          </div>
        ) : (
          <List
            size="small"
            dataSource={filteredCommits}
            renderItem={(commit) => (
              <List.Item
                key={commit.sha}
                onClick={() => onCommitSelect(commit)}
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedCommit?.sha === commit.sha
                    ? 'border-l-2 border-l-blue-500 bg-blue-50'
                    : ''
                }`}
                style={{ padding: '12px 16px' }}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Tooltip title={commit.sha}>
                        <span className="font-mono text-sm font-medium text-gray-700">
                          {commit.sha.substring(0, 7)}
                        </span>
                      </Tooltip>
                      {getTestTypeBadges(commit)}
                    </div>
                    <Badge
                      status={getBadgeStatus(commit.aggregationStatus)}
                      text={
                        <span className="text-xs text-gray-500">
                          {commit.pipelineCount > 1
                            ? `${commit.pipelineCount}p`
                            : commit.pipelineCount === 1 ? '1p' : '0p'}
                        </span>
                      }
                    />
                  </div>
                  
                  <Tooltip title={commit.commitMessage}>
                    <div className="text-sm text-gray-900 line-clamp-2 mb-1">
                      {commit.commitMessage}
                    </div>
                  </Tooltip>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Tooltip title={commit.author}>
                      <span className="truncate max-w-24">
                        {commit.author}
                      </span>
                    </Tooltip>
                    <span>·</span>
                    <span>{formatTimeAgo(commit.timestamp)}</span>
                  </div>

                  {commit.branches.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Tooltip title={commit.branches.join(', ')}>
                        <Space className="truncate max-w-48">
                          <TagsOutlined />
                          {commit.branches.join(', ')}
                        </Space>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default CommitsList;