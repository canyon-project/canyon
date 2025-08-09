import {Outlet, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import {useRequest} from 'ahooks';
import axios from 'axios';
import {useMemo, useState} from 'react';
import {Button, Checkbox, Input, Space} from 'antd';

type CommitItem = {
  id: string;
  sha: string;
  commitMessage?: string;
};

const MultipleCommits = () => {
  const { repo } = useOutletContext<any>();
  const params = useParams();
  const navigate = useNavigate();

  const { data: commitList = [] } = useRequest(() =>
    axios.get(`/api/repo/${repo.id}/commits`).then(r => r.data).then(res => {
      return (res.commits || []).map((i: any) => ({ id: i.sha, sha: i.sha, commitMessage: '' }));
    })
  );

  const [searchText, setSearchText] = useState('');
  const filtered = useMemo(() => {
    if (!searchText) return commitList;
    const s = searchText.toLowerCase();
    return (commitList as CommitItem[]).filter(c => c.sha.includes(s));
  }, [commitList, searchText]);

  const [selected, setSelected] = useState<string[]>([]);

  const onToggle = (sha: string, checked: boolean) => {
    setSelected(prev => {
      if (checked) return Array.from(new Set([sha, ...prev]));
      return prev.filter(s => s !== sha);
    });
  };

  const onConfirm = () => {
    if (selected.length === 0) return;
    navigate(`/${params.provider}/${params.org}/${params.repo}/multiple-commits/${selected.join(',')}`);
  };

  return (
    <div className={'flex gap-[20px] px-[20px]'}>
      <div className="w-[260px] shadow p-2">
        <Space direction="vertical" className="w-full">
          <Input
            placeholder="Search sha"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            size="small"
            allowClear
          />
          <div className="max-h-[60vh] overflow-auto space-y-1">
            {filtered.map((c: any) => (
              <div key={c.sha} className="flex items-center text-xs">
                <Checkbox
                  checked={selected.includes(c.sha)}
                  onChange={e => onToggle(c.sha, e.target.checked)}
                >
                  <span className="font-mono">{c.sha.substring(0, 12)}</span>
                </Checkbox>
              </div>
            ))}
          </div>
          <Button type="primary" size="small" disabled={selected.length === 0} onClick={onConfirm}>
            查看
          </Button>
        </Space>
      </div>
      <Outlet context={{ repo }} />
    </div>
  );
};

export default MultipleCommits;


