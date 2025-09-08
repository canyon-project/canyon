import { SearchOutlined, TagsOutlined } from '@ant-design/icons';
import { Badge, Input, List, Space, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

// 扩展 Commit 接口，添加 branches 属性
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
  branches: string[]; // 新增属性，存储 commit 所在的分支
}

interface CommitsListProps {
  commits: Commit[];
  selectedCommit: Commit | null;
  onCommitSelect: (commit: Commit) => void;
}

const CommitsList = ({
  commits,
  selectedCommit,
  onCommitSelect,
}: CommitsListProps) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCommits, setFilteredCommits] = useState(commits);

  useEffect(() => {
    let filtered = commits;

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(
        (commit) =>
          commit.sha.includes(searchText) ||
          commit.commitMessage
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
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
      <div className='flex gap-1'>
        {commit.hasE2E && (
          <Tooltip title='包含 E2E 测试'>
            <Badge color='blue' className='scale-75' />
          </Tooltip>
        )}
        {commit.hasUnitTest && (
          <Tooltip title='包含单元测试'>
            <Badge color='green' className='scale-75' />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className='mb-5 flex h-full w-[260px] flex-col shadow dark:shadow-gray-800'>
      <div className='space-y-1 px-2 pt-2 dark:bg-gray-900'>
        <Input
          placeholder='Search commits'
          prefix={
            <SearchOutlined className='text-gray-400 dark:text-gray-500' />
          }
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className='h-7 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          allowClear
        />
      </div>
      <div className='flex-1 overflow-auto py-1 dark:bg-gray-900'>
        {commits.length === 0 ? (
          <div className='flex justify-center p-4 dark:bg-gray-900'>
            <Spin size='small' />
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className='flex justify-center p-4 dark:bg-gray-900'>
            <span className='text-gray-500 text-xs dark:text-gray-400'>
              No matching commits
            </span>
          </div>
        ) : (
          <Scrollbars
            // This will activate auto hide
            autoHide
            // Hide delay in ms
            autoHideTimeout={1000}
            // Duration for hide animation in ms.
            autoHideDuration={200}
            // This will activate auto-height
            autoHeight
            autoHeightMax={'calc(100vh - 200px)'}
          >
            <List
              size='small'
              dataSource={filteredCommits}
              className='dark:bg-gray-900'
              renderItem={(commit) => (
                <List.Item
                  key={commit.sha}
                  onClick={() => onCommitSelect(commit)}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedCommit?.sha === commit.sha
                      ? 'border-l-2 border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-gray-800 dark:bg-opacity-50'
                      : 'dark:border-gray-700'
                  }`}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                >
                  <div className='w-full'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-1'>
                        <Tooltip title={commit.sha}>
                          <span className='font-medium font-mono text-gray-700 text-xs dark:text-gray-300'>
                            {commit.sha.substring(0, 7)}
                          </span>
                        </Tooltip>
                        {getTestTypeBadges(commit)}
                      </div>
                      <Badge
                        status={getBadgeStatus(commit.aggregationStatus)}
                        text={
                          <span className='text-gray-500 text-xs dark:text-gray-400'>
                            {commit.pipelineCount > 1
                              ? `${commit.pipelineCount}p`
                              : '1p'}
                          </span>
                        }
                        className='scale-90'
                      />
                    </div>
                    <Tooltip title={commit.commitMessage}>
                      <div className='mt-1 line-clamp-1 text-gray-900 text-xs dark:text-gray-200'>
                        {commit.commitMessage}
                      </div>
                    </Tooltip>
                    <div className='mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                      <Tooltip title={commit.author}>
                        <span className='line-clamp-1 max-w-[100px]'>
                          {commit.author}
                        </span>
                      </Tooltip>
                      <span>·</span>
                      <span>1day</span>
                    </div>

                    <div className='mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                      {/* 显示分支信息 */}
                      {commit.branches.length > 0 && (
                        <Tooltip title={commit.branches.join(', ')}>
                          <Space className='line-clamp-1 max-w-[200px]'>
                            <TagsOutlined />
                            {commit.branches.join(', ')}
                          </Space>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Scrollbars>
        )}
      </div>
    </div>
  );
};

export default CommitsList;
