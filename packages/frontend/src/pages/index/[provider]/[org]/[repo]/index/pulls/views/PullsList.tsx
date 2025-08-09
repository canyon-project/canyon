import {List, Badge, Tooltip, Input} from 'antd';
import {useEffect, useState} from 'react';
import {Scrollbars} from 'react-custom-scrollbars';

interface PullItem {
  id: string;
  iid: number;
  title: string;
  author?: string;
  createdAt?: string;
  state?: string;
  webUrl?: string;
  sourceBranch?: string;
  targetBranch?: string;
}

const PullsList = ({ pulls, selectedPull, onPullSelect }: {
  pulls: PullItem[];
  selectedPull: PullItem | null;
  onPullSelect: (pull: PullItem) => void;
}) => {
  const [searchText, setSearchText] = useState('');
  const [filtered, setFiltered] = useState<PullItem[]>(pulls || []);

  useEffect(() => {
    let list = pulls || [];
    if (searchText) {
      const s = searchText.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(s) ||
        String(p.iid).includes(s) ||
        p.author?.toLowerCase().includes(s) ||
        p.sourceBranch?.toLowerCase().includes(s) ||
        p.targetBranch?.toLowerCase().includes(s)
      );
    }
    setFiltered(list);
  }, [pulls, searchText]);

  const statusMap: Record<string, any> = {
    merged: 'success',
    opened: 'processing',
    closed: 'error',
  };

  return (
    <div className="flex h-full flex-col shadow dark:shadow-gray-800 w-[280px] mb-5">
      <div className="space-y-1 px-2 pt-2 dark:bg-gray-900">
        <Input
          placeholder="Search pulls"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="h-7 text-xs dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          allowClear
        />
      </div>
      <div className="flex-1 overflow-auto py-1 dark:bg-gray-900">
        {filtered.length === 0 ? (
          <div className="flex justify-center p-4 dark:bg-gray-900">
            <span className="text-xs text-gray-500 dark:text-gray-400">No pulls</span>
          </div>
        ) : (
          <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={200} autoHeight autoHeightMax={'calc(100vh - 200px)'}>
            <List
              size="small"
              dataSource={filtered}
              className="dark:bg-gray-900"
              renderItem={(pull) => (
                <List.Item
                  key={pull.id}
                  onClick={() => onPullSelect(pull)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedPull?.id === pull.id ? 'border-l-2 border-l-blue-500 bg-blue-50 dark:bg-gray-800 dark:bg-opacity-50 dark:border-l-blue-400' : 'dark:border-gray-700'
                  }`}
                  style={{ cursor: 'pointer', padding: '8px 12px' }}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Tooltip title={`!${pull.iid}`}>
                          <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">!{pull.iid}</span>
                        </Tooltip>
                        <Badge status={statusMap[pull.state || 'opened'] || 'default'} />
                      </div>
                    </div>
                    <Tooltip title={pull.title}>
                      <div className="mt-1 line-clamp-1 text-xs text-gray-900 dark:text-gray-200">
                        {pull.title}
                      </div>
                    </Tooltip>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <span>{pull.author || '-'}</span>
                      <span>·</span>
                      <span>{pull.sourceBranch} → {pull.targetBranch}</span>
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


