import {
  BranchesOutlined,
  DownOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Avatar,
  Dropdown,
  Input,
  message,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import CardPrimary from '@/components/card/Primary';
import SnapshotDrawer from '@/components/snapshot/SnapshotDrawer';
import type { SnapshotFormValues } from '@/components/snapshot/SnapshotDrawer';

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

type BuildTargetSceneInfo = {
  buildTarget: string;
  scenes: SceneInfo[];
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
  buildTargets: string[];
  buildTargetScenes?: BuildTargetSceneInfo[];
  versionID: string;
  coverageID: string;
  reportID: string;
  reportProvider: string;
  scenes?: SceneInfo[];
  authorName?: string | null;
  authorEmail?: string | null;
  createdAt?: string;
  avatar?: string | null;
};

// 展平后的行类型：每个 buildTarget 一行
type FlatCommitRow = CommitRecord & {
  currentBuildTarget: string;
  currentScenes: SceneInfo[]; // 该 buildTarget 的所有 scene
  rowKey: string; // 用于唯一标识每一行
};

const CommitsPage = () => {
  const { t } = useTranslation();
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [onlyDefaultBranch, setOnlyDefaultBranch] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState('');
  const [snapshotDrawerOpen, setSnapshotDrawerOpen] = useState(false);
  const [snapshotDrawerMode, setSnapshotDrawerMode] = useState<'create' | 'records'>('create');
  const [snapshotInitialValues, setSnapshotInitialValues] = useState<Partial<SnapshotFormValues>>({});

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
      } else {
        message.error(t('projects.commits.fetch.failed'));
      }
    } catch (error) {
      message.error(t('projects.commits.fetch.failed'));
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

  // 展平数据：每个 buildTarget 一行（按 sha + buildTarget 分组）
  const flatData = useMemo(() => {
    const result: FlatCommitRow[] = [];
    for (const commit of commits) {
      // 如果有 buildTargetScenes，使用它；否则回退到旧的逻辑
      if (commit.buildTargetScenes && commit.buildTargetScenes.length > 0) {
        for (const buildTargetScene of commit.buildTargetScenes) {
          const buildTarget = buildTargetScene.buildTarget || '';
          const scenes = buildTargetScene.scenes || [];

          // 每个 buildTarget 创建一行
          result.push({
            ...commit,
            currentBuildTarget: buildTarget,
            currentScenes: scenes,
            rowKey: `${commit.sha}_${buildTarget}`,
          });
        }
      } else {
        // 回退逻辑：如果没有 buildTargetScenes，使用 buildTargets 和 scenes
        const buildTargets = commit.buildTargets || [];
        const scenes = commit.scenes || [];

        if (buildTargets.length === 0) {
          // 如果没有 buildTargets，至少创建一行
          result.push({
            ...commit,
            currentBuildTarget: commit.buildTarget || '',
            currentScenes: scenes,
            rowKey: `${commit.sha}_empty`,
          });
        } else {
          // 为每个 buildTarget 创建一行，所有 scene 都关联到该 buildTarget
          for (const buildTarget of buildTargets) {
            result.push({
              ...commit,
              currentBuildTarget: buildTarget,
              currentScenes: scenes,
              rowKey: `${commit.sha}_${buildTarget}`,
            });
          }
        }
      }
    }
    return result;
  }, [commits]);

  const columns: ColumnsType<FlatCommitRow> = [
    {
      title: (
        <Space>
          <BranchesOutlined />
          {t('projects.commits.columns.sha')}
        </Space>
      ),
      dataIndex: 'sha',
      key: 'sha',
      width: 100,
      render: (_: string, record: FlatCommitRow) => (
        <Link
          to={`/${params.provider}/${params.org}/${params.repo}/commit/${record.sha}`}
        >
          {record.sha.substring(0, 7)}
        </Link>
      ),
    },
    {
      title: t('projects.message'),
      key: 'commitInfo',
      ellipsis: true,
      render: (_: any, record: FlatCommitRow) => {
        const hasMessage = record.commitMessage;
        const hasAuthor = record.authorName || record.authorEmail;
        const hasTime = record.createdAt;

        if (!hasMessage && !hasAuthor && !hasTime) {
          return '-';
        }

        return (
          <Space direction='vertical' size={2} style={{ width: '100%' }}>
            {hasMessage && (
              <Text ellipsis={{ tooltip: record.commitMessage }}>
                {record.commitMessage}
              </Text>
            )}
            {hasAuthor && (
              <Space size={4}>
                {record.avatar ? (
                  <Avatar src={record.avatar} size={20} />
                ) : (
                  <Avatar size={20} icon={<UserOutlined />} />
                )}
                <Text type='secondary' style={{ fontSize: '12px' }}>
                  {record.authorName || record.authorEmail || '-'}
                  {record.authorEmail && record.authorName && (
                    <> ({record.authorEmail})</>
                  )}
                </Text>
              </Space>
            )}
            {hasTime && (
              <Text type='secondary' style={{ fontSize: '12px' }}>
                {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: t('projects.commits.columns.buildTarget'),
      dataIndex: 'currentBuildTarget',
      key: 'currentBuildTarget',
      render: (text: string) => {
        return text ? <Tag>{text}</Tag> : '-';
      },
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
      width: 280,
      render: (_: any, record: FlatCommitRow) => {
        const detailPath = `/report/-/${params.provider}/${params.org}/${params.repo}/commit/${record.sha}/-/?build_target=${record.currentBuildTarget}`;

        // 构建报告路径的辅助函数
        const buildReportPath = (scene: Record<string, unknown>) => {
          const searchParams = new URLSearchParams();
          if (record.currentBuildTarget) {
            searchParams.set('build_target', record.currentBuildTarget);
          }
          if (record.reportID) {
            searchParams.set('report_id', record.reportID);
          }
          if (record.reportProvider) {
            searchParams.set('report_provider', record.reportProvider);
          }
          if (scene && Object.keys(scene).length > 0) {
            searchParams.set('scene', JSON.stringify(scene));
          }
          const queryString = searchParams.toString();
          return `/report/-/${params.provider}/${params.org}/${params.repo}/commit/${record.sha}/-/${queryString ? `?${queryString}` : ''}`;
        };

        // 处理场景显示
        const scenes = record.currentScenes || [];
        let sceneDropdown = null;

        if (scenes.length > 0) {
          // 收集所有场景中的所有 key-value 对，去重
          const kvPairs = new Map<string, { key: string; value: unknown }>();
          scenes.forEach((sceneInfo) => {
            const scene = sceneInfo.scene || {};
            Object.entries(scene).forEach(([key, value]) => {
              const kvKey = `${key}=${value}`;
              if (!kvPairs.has(kvKey)) {
                kvPairs.set(kvKey, { key, value });
              }
            });
          });

          const kvPairsArray = Array.from(kvPairs.values());

          if (kvPairsArray.length > 0) {
            if (kvPairsArray.length === 1) {
              // 如果只有一个 key-value 对，直接显示链接
              const { key, value } = kvPairsArray[0];
              const sceneObj = { [key]: value };
              const reportPath = buildReportPath(sceneObj);
              sceneDropdown = (
                <a href={reportPath} target='_blank' rel='noreferrer'>
                  {key}={String(value)}
                </a>
              );
            } else {
              // 如果有多个 key-value 对，使用下拉菜单
              const menuItems: MenuProps['items'] = kvPairsArray.map(
                ({ key, value }, index) => {
                  const sceneObj = { [key]: value };
                  const reportPath = buildReportPath(sceneObj);

                  return {
                    key: index,
                    label: (
                      <a href={reportPath} target='_blank' rel='noreferrer'>
                        {key}={String(value)}
                      </a>
                    ),
                  };
                },
              );

              sceneDropdown = (
                <Dropdown menu={{ items: menuItems }} placement='bottomLeft'>
                  <a onClick={(e) => e.preventDefault()}>
                    {t('projects.commits.columns.scene')} <DownOutlined />
                  </a>
                </Dropdown>
              );
            }
          }
        }

        return (
          <Space wrap>
            <Link to={detailPath} target={'_blank'}>
              {t('projects.commits.columns.overall')}
            </Link>
            {sceneDropdown}
            <a onClick={() => openSnapshotCreate(record)}>
              {t('projects.snapshot.button.create')}
            </a>
            <a onClick={openSnapshotRecords}>
              {t('projects.snapshot.button.records')}
            </a>
          </Space>
        );
      },
    },
  ];

  const openSnapshotCreate = (record: FlatCommitRow) => {
    setSnapshotInitialValues({
      repoID: repo?.id ?? '',
      provider: params.provider ?? '',
      sha: record.sha ?? '',
      title: record.commitMessage ?? '',
      description: '',
    });
    setSnapshotDrawerMode('create');
    setSnapshotDrawerOpen(true);
  };

  const openSnapshotRecords = () => {
    setSnapshotInitialValues({
      repoID: repo?.id ?? '',
      provider: params.provider ?? '',
    });
    setSnapshotDrawerMode('records');
    setSnapshotDrawerOpen(true);
  };

  if (!repo) {
    return <div>{t('projects.commits.loading')}</div>;
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
      <SnapshotDrawer
        open={snapshotDrawerOpen}
        onClose={() => setSnapshotDrawerOpen(false)}
        mode={snapshotDrawerMode}
        initialValues={snapshotInitialValues}
      />
      <CardPrimary>
        <Table<FlatCommitRow>
          columns={columns}
          dataSource={flatData}
          loading={loading}
          rowKey='rowKey'
          pagination={{
            current: page,
            pageSize: pageSize,
            total: flatData.length,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} ${t('common.total_items', { total })}`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
            },
          }}
        />
      </CardPrimary>
    </div>
  );
};

export default CommitsPage;
