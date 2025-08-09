import {Link, Outlet, useNavigate, useOutletContext, useParams} from 'react-router-dom';
import {useRequest} from 'ahooks';
import axios from 'axios';
import {Card, Progress, Table, Tooltip} from 'antd';

const columns = [
  { title: '文件', dataIndex: 'path', key: 'path', render: (t: string) => (
      <Tooltip title={t}><span className="font-mono text-xs">{t}</span></Tooltip>
    ) },
  { title: 'S', dataIndex: ['statements','pct'], key: 's', width: 90, render: (p: number) => <Progress percent={Number((p||0).toFixed?.(1) ?? p)} size="small"/> },
  { title: 'F', dataIndex: ['functions','pct'], key: 'f', width: 90, render: (p: number) => <Progress percent={Number((p||0).toFixed?.(1) ?? p)} size="small"/> },
  { title: 'B', dataIndex: ['branches','pct'], key: 'b', width: 90, render: (p: number) => <Progress percent={Number((p||0).toFixed?.(1) ?? p)} size="small"/> },
];

const MultipleCommitsDetail = () => {
  const { repo } = useOutletContext<any>();
  const params = useParams();

  const shas = (params.shas || '').toString();

  const { data: summary } = useRequest(() => {
    return axios
      .get(`/api/coverage/summary/map/multiple-commits?provider=gitlab&repoID=${repo.id}&shas=${shas}`)
      .then(res => res.data);
  }, { refreshDeps: [repo?.id, shas] });

  const { data: files } = useRequest(() => {
    return axios
      .get(`/api/coverage/summary/map/multiple-commits?provider=gitlab&repoID=${repo.id}&shas=${shas}`)
      .then(res => res.data)
      .then((obj) => Object.values(obj || {} as any));
  }, { refreshDeps: [repo?.id, shas] });

  const overallPercent = (() => {
    if (!files || !Array.isArray(files)) return 0;
    let covered = 0, total = 0;
    (files as any[]).forEach((f) => {
      total += f?.statements?.total || 0;
      covered += f?.statements?.covered || 0;
    });
    if (total === 0) return 100;
    return +(covered / total * 100).toFixed(1);
  })();

  const navigate = useNavigate();
  const onOpenFile = (path: string) => {
    navigate(`/${params.provider}/${params.org}/${params.repo}/multiple-commits/${shas}/-/${path}`);
  };

  return (
    <div className={'flex-1 p-4 space-y-4'}>
      <Card size="small" title={<span className="text-sm">多 commits 覆盖率汇总</span>} extra={<span className="font-mono text-xs">{shas}</span>}>
        <Progress type="circle" percent={overallPercent} size={52} />
      </Card>
      <Card size="small" title={<span className="text-sm">文件覆盖率</span>}>
        <Table
          size="small"
          rowKey={(r:any)=>r.path}
          columns={columns as any}
          dataSource={files || []}
          pagination={false}
          onRow={(record:any) => ({ onClick: () => onOpenFile(record.path) })}
        />
      </Card>
      <Outlet context={{ repo }} />
    </div>
  );
};

export default MultipleCommitsDetail;


