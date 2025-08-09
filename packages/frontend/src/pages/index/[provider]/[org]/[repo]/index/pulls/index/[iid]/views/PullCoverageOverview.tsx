import {Badge, Card, Progress, Space, Table, Tooltip} from 'antd';
import {useOutletContext, useParams} from 'react-router-dom';
import {useRequest} from 'ahooks';
import axios from 'axios';

const columns = [
  {
    title: '文件',
    dataIndex: 'path',
    key: 'path',
    render: (text: string) => (
      <Tooltip title={text}>
        <span className="font-mono text-xs">{text}</span>
      </Tooltip>
    ),
  },
  {
    title: 'S',
    dataIndex: ['statements', 'pct'],
    key: 's',
    width: 100,
    render: (pct: number) => (
      <Progress percent={Number.isFinite(pct) ? Number(pct.toFixed(1)) : 0} size="small" />
    ),
  },
  {
    title: 'F',
    dataIndex: ['functions', 'pct'],
    key: 'f',
    width: 100,
    render: (pct: number) => (
      <Progress percent={Number.isFinite(pct) ? Number(pct.toFixed(1)) : 0} size="small" />
    ),
  },
  {
    title: 'B',
    dataIndex: ['branches', 'pct'],
    key: 'b',
    width: 100,
    render: (pct: number) => (
      <Progress percent={Number.isFinite(pct) ? Number(pct.toFixed(1)) : 0} size="small" />
    ),
  },
  {
    title: '变更',
    dataIndex: 'change',
    key: 'change',
    width: 80,
    render: (changed: boolean) => (
      changed ? <Badge color="blue" text="changed" /> : <span>-</span>
    ),
  },
];

const PullCoverageOverview = () => {
  const { repo, pull } = useOutletContext<any>();
  const params = useParams();

  const { data: summary } = useRequest(() => {
    if (!pull) return Promise.resolve(null);
    return axios
      .get(`/api/coverage/overview/pulls?provider=gitlab&repoID=${repo.id}&pullNumber=${pull.iid}`)
      .then(res => res.data);
  }, { refreshDeps: [pull?.iid, repo?.id] });

  const { data: fileMap } = useRequest(() => {
    if (!pull) return Promise.resolve([] as any[]);
    return axios
      .get(`/api/coverage/map/pull?provider=gitlab&repoID=${repo.id}&pullNumber=${pull.iid}`)
      .then(res => res.data)
      .then((obj) => {
        if (!obj) return [];
        return Object.values(obj as Record<string, any>);
      });
  }, { refreshDeps: [pull?.iid, repo?.id] });

  const overallPercent = (() => {
    if (!summary) return 0;
    const p = summary.percent;
    if (typeof p === 'string') {
      return Number(p.replace('%','')) || 0;
    }
    if (typeof p === 'number') return p;
    return 0;
  })();

  return (
    <div className={'flex-1 space-y-4'}>
      <Card size="small">
        <Space align="center" className="w-full justify-between">
          <div className="text-sm">PR 覆盖率汇总</div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">overall</span>
            <Progress type="circle" percent={Number(overallPercent.toFixed(1))} size={46} />
          </div>
        </Space>
      </Card>

      <Card size="small" title={<span className="text-sm">变更文件覆盖率</span>}>
        <Table
          size="small"
          rowKey={(r) => r.path}
          columns={columns as any}
          dataSource={fileMap || []}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default PullCoverageOverview;


