import { SearchOutlined, TagsOutlined } from '@ant-design/icons';
import { Badge, Input, List, Space, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

interface PullItem {
  id: string;
  iid: number;
  title: string;
  author: string;
  createdAt: string;
  state: string;
  sourceBranch?: string;
  targetBranch?: string;
  webUrl?: string;
}

interface PullsListProps {
  pulls: PullItem[];
  selectedPull: PullItem | null;
  onPullSelect: (pull: PullItem) => void;
}

const PullsList = ({ pulls, selectedPull, onPullSelect }: PullsListProps) => {
  const [searchText, setSearchText] = useState('');
  const [filteredPulls, setFilteredPulls] = useState(pulls);

  useEffect(() => {
    let filtered = pulls;
    if (searchText) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          String(p.iid).includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          (p.sourceBranch || '').toLowerCase().includes(q) ||
          (p.targetBranch || '').toLowerCase().includes(q),
      );
    }
    setFilteredPulls(filtered);
  }, [searchText, pulls]);

  const getBadgeStatus = (state: string) => {
    switch (state) {
      case 'merged':
        return 'success';
      case 'opened':
        return 'processing';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className='mb-5 flex h-full w-[260px] flex-col shadow dark:shadow-gray-800'>
      <div className='space-y-1 px-2 pt-2 dark:bg-gray-900'>
        <Input
          placeholder='Search pulls'
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
        {pulls.length === 0 ? (
          <div className='flex justify-center p-4 dark:bg-gray-900'>
            <Spin size='small' />
          </div>
        ) : filteredPulls.length === 0 ? (
          <div className='flex justify-center p-4 dark:bg-gray-900'>
            <span className='text-gray-500 text-xs dark:text-gray-400'>
              No matching pulls
            </span>
          </div>
        ) : (
          <Scrollbars
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
            autoHeight
            autoHeightMax={'calc(100vh - 200px)'}
          >
            <List
              size='small'
              dataSource={filteredPulls}
              className='dark:bg-gray-900'
              renderItem={(pull) => (
                <List.Item
                  key={pull.id}
                  onClick={() => onPullSelect(pull)}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedPull?.id === pull.id
                      ? 'border-l-2 border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-gray-800 dark:bg-opacity-50'
                      : 'dark:border-gray-700'
                  }`}
                  style={{ cursor: 'pointer', padding: '8px 12px' }}
                >
                  <div className='w-full'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-1'>
                        <Tooltip title={`!${pull.iid}`}>
                          <span className='font-medium font-mono text-gray-700 text-xs dark:text-gray-300'>
                            !{pull.iid}
                          </span>
                        </Tooltip>
                      </div>
                      <Badge
                        status={getBadgeStatus(pull.state) as any}
                        text={
                          <span className='text-gray-500 text-xs dark:text-gray-400'>
                            {pull.state}
                          </span>
                        }
                        className='scale-90'
                      />
                    </div>
                    <Tooltip title={pull.title}>
                      <div className='mt-1 line-clamp-1 text-gray-900 text-xs dark:text-gray-200'>
                        {pull.title}
                      </div>
                    </Tooltip>
                    <div className='mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                      <Tooltip title={pull.author}>
                        <span className='line-clamp-1 max-w-[140px]'>
                          {pull.author}
                        </span>
                      </Tooltip>
                      <span>·</span>
                      <span>
                        {new Date(pull.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400'>
                      {(pull.sourceBranch || pull.targetBranch) && (
                        <Tooltip
                          title={`${pull.sourceBranch} → ${pull.targetBranch}`}
                        >
                          <Space className='line-clamp-1 max-w-[200px]'>
                            <TagsOutlined />
                            {pull.sourceBranch} → {pull.targetBranch}
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

export default PullsList;
