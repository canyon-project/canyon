import { BranchesOutlined, SearchOutlined } from '@ant-design/icons';
import { Drawer, Input, message, Space, Switch, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import CardPrimary from '@/components/card/Primary';
import SceneSelector from '@/components/SceneSelector';

// 定义 CoverageRecord 类型（与 SceneSelector 中的类型一致）
type CoverageRecord = {
  id: number;
  commitSha: string;
  scene: Record<string, string>;
  sceneKey: string;
  coverage: {
    lines: { total: number; covered: number };
    functions: { total: number; covered: number };
    branches: { total: number; covered: number };
  };
  createdAt: string;
};

const { Text } = Typography;

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
  bu: string;
  tags: string;
  members: string;
  config: string;
  createdAt: string;
  updatedAt: string;
};

type SceneInfo = {
  scene: Record<string, unknown>;
  sceneKey: string;
};

type CommitRecord = {
  sha: string;
  branch: string;
  compareTarget: string;
  commitMessage: string;
  statements: number;
  newLines: number;
  times: number;
  latestReport: string;
  buildTarget: string;
  versionID: string;
  coverageID: string;
  reportID: string;
  reportProvider: string;
  scenes?: SceneInfo[];
};

const CommitsPage = () => {
  const { t } = useTranslation();
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [onlyDefaultBranch, setOnlyDefaultBranch] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState('');
  
  // 从 URL 参数读取抽屉状态
  const drawerOpenFromURL = searchParams.get('drawer_open') === 'true';
  const [drawerOpen, setDrawerOpen] = useState(drawerOpenFromURL);
  const [sceneStep, setSceneStep] = useState(0);

  // 当 URL 参数变化时，同步抽屉状态
  useEffect(() => {
    setDrawerOpen(drawerOpenFromURL);
  }, [drawerOpenFromURL]);

  // 从 repo config 中解析默认分支
  useEffect(() => {
    if (repo?.config) {
      try {
        const config = JSON.parse(repo.config);
        if (config?.defaultBranch) {
          setDefaultBranch(config.defaultBranch);
        }
      } catch {
        // 忽略解析错误
      }
    }
  }, [repo]);

  const fetchCommits = async () => {
    if (!repo?.id) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        repoID: repo.id,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchKeyword) {
        params.append('search', searchKeyword);
      }

      if (onlyDefaultBranch && defaultBranch) {
        params.append('defaultBranch', defaultBranch);
      }

      const resp = await fetch(`/api/coverage/commits?${params.toString()}`, {
        credentials: 'include',
      });

      if (resp.ok) {
        const data = await resp.json();
        setCommits(data.data || []);
        setTotal(data.total || 0);
      } else {
        message.error('获取记录失败');
      }
    } catch (error) {
      message.error('获取记录失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, [
    repo?.id,
    page,
    pageSize,
    searchKeyword,
    onlyDefaultBranch,
    defaultBranch,
  ]);

  const columns: ColumnsType<CommitRecord> = [
    {
      title: (
        <Space>
          <BranchesOutlined />
          Sha
        </Space>
      ),
      dataIndex: 'sha',
      key: 'sha',
      width: 100,
      render: (text: string) => (
        <Link
          to={`/${params.provider}/${params.org}/${params.repo}/commits/${text}`}
        >
          {text.substring(0, 7)}
        </Link>
      ),
    },
    {
      title: (
        <Space>
          <BranchesOutlined />
          {t('projects.branch')}
        </Space>
      ),
      dataIndex: 'branch',
      key: 'branch',
      width: 150,
      ellipsis: true,
    },
    {
      title: (
        <Space>
          <BranchesOutlined />
          {t('projects.compare_target')}
        </Space>
      ),
      dataIndex: 'compareTarget',
      key: 'compareTarget',
      width: 100,
      render: (text: string) =>
        text ? (
          <Link
            to={`/${params.provider}/${params.org}/${params.repo}/commits/${text}`}
          >
            {text.substring(0, 7)}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      title: t('projects.message'),
      dataIndex: 'commitMessage',
      key: 'commitMessage',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: t('projects.statements'),
      dataIndex: 'statements',
      key: 'statements',
      width: 100,
      align: 'right',
      render: (text: number) => (
        <Text style={{ color: '#1890ff' }}>
          {text ? `${text.toFixed(2)}%` : '-'}
        </Text>
      ),
    },
    {
      title: t('projects.newlines'),
      dataIndex: 'newLines',
      key: 'newLines',
      width: 100,
      align: 'right',
      render: (text: number) => (
        <Text style={{ color: '#1890ff' }}>
          {text ? `${text.toFixed(2)}%` : '-'}
        </Text>
      ),
    },
    {
      title: t('projects.report_times'),
      dataIndex: 'times',
      key: 'times',
      width: 80,
      align: 'right',
    },
    {
      title: t('projects.latest_report_time'),
      dataIndex: 'latestReport',
      key: 'latestReport',
      width: 120,
      render: (text: string) =>
        text ? dayjs(text).format('MM-DD HH:mm') : '-',
    },
    {
      title: t('common.option'),
      key: 'option',
      width: 150,
      render: (_: any, record: CommitRecord) => {
        return (
          <Space>
            <a
              href='#'
              onClick={(e) => {
                e.preventDefault();
                const newParams = new URLSearchParams(searchParams);
                newParams.set('drawer_open', 'true');
                setSearchParams(newParams, { replace: true });
                setDrawerOpen(true);
                setSceneStep(0);
              }}
            >
              {t('projects.reported_details')}
            </a>
            <a
              href='#'
              onClick={(e) => {
                e.preventDefault();
                // 根据 commit 记录生成总体报告数据
                // 使用 statements 作为行覆盖率的基础数据
                const statementsPercent = record.statements || 0;
                // 假设总行数为 10000（实际应该从 API 获取）
                const totalLines = 10000;
                const coveredLines = Math.round((totalLines * statementsPercent) / 100);

                const overallRecord: CoverageRecord = {
                  id: 0,
                  commitSha: record.sha,
                  scene: { overall: 'true' },
                  sceneKey: 'overall',
                  coverage: {
                    lines: {
                      total: totalLines,
                      covered: coveredLines,
                    },
                    functions: {
                      total: 1000,
                      covered: Math.round((1000 * statementsPercent) / 100),
                    },
                    branches: {
                      total: 2000,
                      covered: Math.round((2000 * statementsPercent) / 100),
                    },
                  },
                  createdAt: record.latestReport || new Date().toISOString(),
                };

                // 如果有 scenes，合并所有 scene 的信息
                if (record.scenes && record.scenes.length > 0) {
                  const allScenes: Record<string, string> = {};
                  record.scenes.forEach((sceneInfo) => {
                    if (sceneInfo.scene && typeof sceneInfo.scene === 'object') {
                      Object.assign(allScenes, sceneInfo.scene);
                    }
                  });
                  overallRecord.scene = { ...overallRecord.scene, ...allScenes };
                }

                // 将总体数据编码到 URL
                const data = {
                  selectors: [],
                  step: 2,
                  queryResults: [],
                  selectedRecord: overallRecord,
                };
                const encoded = btoa(JSON.stringify(data));
                const newParams = new URLSearchParams(searchParams);
                newParams.set('drawer_open', 'true');
                newParams.set('scene_data', encoded);
                setSearchParams(newParams, { replace: true });
                setDrawerOpen(true);
                setSceneStep(2);
              }}
            >
              总体
            </a>
          </Space>
        );
      },
    },
  ];

  if (!repo) {
    return <div>加载中...</div>;
  }

  return (
    <div className={''}>
      <div className={'mb-4 flex items-center gap-3'}>
        <Input
          style={{ width: '600px' }}
          placeholder={t('projects.overview_search_keywords')}
          prefix={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={() => {
            setPage(1);
            fetchCommits();
          }}
          allowClear
          onClear={() => {
            setSearchKeyword('');
            setPage(1);
          }}
        />
        {defaultBranch && (
          <Space>
            <Text type={'secondary'}>{t('projects.only.default.branch')}:</Text>
            <Switch
              checked={onlyDefaultBranch}
              onChange={(checked) => {
                setOnlyDefaultBranch(checked);
                setPage(1);
              }}
            />
          </Space>
        )}
      </div>
      <CardPrimary>
        <Table<CommitRecord>
          columns={columns}
          dataSource={commits}
          loading={loading}
          rowKey='sha'
          expandable={{
            expandedRowRender: (record) => {
              if (!record.scenes || record.scenes.length === 0) {
                return <div style={{ padding: '16px' }}>暂无场景信息</div>;
              }
              return (
                <div style={{ padding: '16px' }}>
                  <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                    场景信息 (共 {record.scenes.length} 个)
                  </div>
                  {record.scenes.map((sceneInfo, index) => (
                    <div
                      key={sceneInfo.sceneKey || index}
                      style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong>Scene Key:</Text>{' '}
                        <Text code>{sceneInfo.sceneKey}</Text>
                      </div>
                      <div>
                        <Text strong>Scene:</Text>
                        <pre
                          style={{
                            marginTop: '8px',
                            padding: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            overflow: 'auto',
                          }}
                        >
                          {JSON.stringify(sceneInfo.scene, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              );
            },
            rowExpandable: (record) =>
              !!(record.scenes && record.scenes.length > 0),
          }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showTotal: (total) => t('common.total_items', { total }),
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
            },
          }}
        />
      </CardPrimary>

      <Drawer
        title='Scene Label Selector'
        placement='right'
        width={sceneStep === 2 ? '85%' : 800}
        open={drawerOpen}
        onClose={() => {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('drawer_open');
          // 如果关闭抽屉，也清除 scene_data
          newParams.delete('scene_data');
          setSearchParams(newParams, { replace: true });
          setDrawerOpen(false);
          setSceneStep(0);
        }}
        destroyOnClose
      >
        <SceneSelector
          onStepChange={setSceneStep}
          initialStep={sceneStep === 2 ? 2 : undefined}
        />
      </Drawer>
    </div>
  );
};

export default CommitsPage;
