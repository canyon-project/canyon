import { BranchesOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Dropdown,
  Input,
  message,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import CardPrimary from '@/components/card/Primary';

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
  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [onlyDefaultBranch, setOnlyDefaultBranch] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState('');
  
  // 查看报告弹窗状态
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [currentCommit, setCurrentCommit] = useState<CommitRecord | null>(null);
  const [selectedBuildTarget, setSelectedBuildTarget] = useState<string>('');
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [availableBuildTargets, setAvailableBuildTargets] = useState<string[]>([]);
  const [availableScenes, setAvailableScenes] = useState<Array<{ label: string; value: string; scene: Record<string, unknown> }>>([]);
  const [loadingScenes, setLoadingScenes] = useState(false);

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

  // 当 buildTarget 改变时，自动加载场景
  useEffect(() => {
    if (reportModalVisible && currentCommit && selectedBuildTarget && repo?.id) {
      setLoadingScenes(true);
      fetch(`/api/coverage/commits/scenes?repoID=${encodeURIComponent(repo.id)}&sha=${encodeURIComponent(currentCommit.sha)}&buildTarget=${encodeURIComponent(selectedBuildTarget)}`, {
        credentials: 'include',
      })
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          throw new Error('Failed to fetch scenes');
        })
        .then((data) => {
          const scenes = data.scenes || [];
          const sceneOptions = scenes.map((sceneInfo: SceneInfo) => {
            const scene = sceneInfo.scene || {};
            const sceneLabel = Object.entries(scene)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ') || '(空)';
            return {
              label: sceneLabel,
              value: JSON.stringify(scene),
              scene: scene,
            };
          });
          setAvailableScenes(sceneOptions.length > 0 ? sceneOptions : [{ label: '(空)', value: JSON.stringify({}), scene: {} }]);
        })
        .catch(() => {
          // 如果 API 不存在，使用当前 commit 的场景
          const sceneOptions = (currentCommit.scenes || []).map((sceneInfo) => {
            const scene = sceneInfo.scene || {};
            const sceneLabel = Object.entries(scene)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ') || '(空)';
            return {
              label: sceneLabel,
              value: JSON.stringify(scene),
              scene: scene,
            };
          });
          setAvailableScenes(sceneOptions.length > 0 ? sceneOptions : [{ label: '(空)', value: JSON.stringify({}), scene: {} }]);
        })
        .finally(() => {
          setLoadingScenes(false);
        });
    }
  }, [reportModalVisible, currentCommit, selectedBuildTarget, repo?.id]);



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
      title: t('projects.message'),
      dataIndex: 'commitMessage',
      key: 'commitMessage',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Build Target',
      dataIndex: 'buildTarget',
      key: 'buildTarget',
      // width: 120,
      render: (text: string) => (text ? <Tag>{text}</Tag> : '-'),
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
      width: 200,
      render: (_: any, record: CommitRecord) => {
        const detailPath = `/${params.provider}/${params.org}/${params.repo}/commits/${record.sha}`;
        
        // 构建报告路径的辅助函数
        const buildReportPath = (scene?: Record<string, unknown>) => {
          const searchParams = new URLSearchParams();
          if (record.buildTarget) {
            searchParams.set('build_target', record.buildTarget);
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

        // 收集所有场景中的所有 key-value 对，去重
        const kvPairs = new Map<string, { key: string; value: unknown }>();
        if (record.scenes && record.scenes.length > 0) {
          record.scenes.forEach((sceneInfo) => {
            const scene = sceneInfo.scene || {};
            Object.entries(scene).forEach(([key, value]) => {
              const kvKey = `${key}=${value}`;
              if (!kvPairs.has(kvKey)) {
                kvPairs.set(kvKey, { key, value });
              }
            });
          });
        }

        const kvPairsArray = Array.from(kvPairs.values());

        // 场景下拉菜单
        let sceneDropdown = null;
        if (kvPairsArray.length > 0) {
          if (kvPairsArray.length === 1) {
            // 如果只有一个 key-value 对，直接显示链接
            const { key, value } = kvPairsArray[0];
            const scene = { [key]: value };
            const reportPath = buildReportPath(scene);
            sceneDropdown = (
              <a href={reportPath} target='_blank' rel='noreferrer'>
                {key}={String(value)}
              </a>
            );
          } else {
            // 如果有多个 key-value 对，使用下拉菜单
            const menuItems: MenuProps['items'] = kvPairsArray.map(({ key, value }, index) => {
              const scene = { [key]: value };
              const reportPath = buildReportPath(scene);
              
              return {
                key: index,
                label: (
                  <a href={reportPath} target='_blank' rel='noreferrer'>
                    {key}={String(value)}
                  </a>
                ),
              };
            });

            sceneDropdown = (
              <Dropdown menu={{ items: menuItems }} placement='bottomLeft'>
                <a onClick={(e) => e.preventDefault()}>
                  场景 <DownOutlined />
                </a>
              </Dropdown>
            );
          }
        }

        return (
          <Space>
            <Link to={detailPath}>{t('projects.reported_details')}</Link>
            {sceneDropdown}
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
          pagination={{
            current: page,
            pageSize: pageSize,
            total: commits.length,
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

      {/* 查看报告弹窗 */}
      <Modal
        title='查看报告'
        open={reportModalVisible}
        onCancel={() => {
          setReportModalVisible(false);
          setCurrentCommit(null);
          setSelectedBuildTarget('');
          setSelectedScene('');
          setAvailableBuildTargets([]);
          setAvailableScenes([]);
        }}
        onOk={() => {
          if (!currentCommit) return;
          
          // 构建报告路径
          const searchParams = new URLSearchParams();
          if (selectedBuildTarget) {
            searchParams.set('build_target', selectedBuildTarget);
          }
          if (currentCommit.reportID) {
            searchParams.set('report_id', currentCommit.reportID);
          }
          if (currentCommit.reportProvider) {
            searchParams.set('report_provider', currentCommit.reportProvider);
          }
          if (selectedScene) {
            try {
              const sceneObj = JSON.parse(selectedScene);
              searchParams.set('scene', JSON.stringify(sceneObj));
            } catch {
              // 忽略解析错误
            }
          }
          
          const queryString = searchParams.toString();
          const reportPath = `/report/-/${params.provider}/${params.org}/${params.repo}/commit/${currentCommit.sha}/-/${queryString ? `?${queryString}` : ''}`;
          
          window.open(reportPath, '_blank');
          setReportModalVisible(false);
          setCurrentCommit(null);
          setSelectedBuildTarget('');
          setSelectedScene('');
          setAvailableBuildTargets([]);
          setAvailableScenes([]);
        }}
        okText='确定'
        cancelText='取消'
      >
        {currentCommit && (
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            <div>
              <Text strong>Commit SHA: </Text>
              <Text code>{currentCommit.sha.substring(0, 7)}</Text>
            </div>
            
            <div>
              <Text strong>Build Target: </Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder='选择 Build Target'
                value={selectedBuildTarget}
                onChange={async (value) => {
                  setSelectedBuildTarget(value);
                  setSelectedScene(''); // 清空场景选择
                  
                  // 查询该 buildTarget 下的所有场景
                  if (!currentCommit || !repo?.id) return;
                  
                  setLoadingScenes(true);
                  try {
                    const resp = await fetch(
                      `/api/coverage/commits/scenes?repoID=${encodeURIComponent(repo.id)}&sha=${encodeURIComponent(currentCommit.sha)}&buildTarget=${encodeURIComponent(value)}`,
                      { credentials: 'include' }
                    );
                    if (resp.ok) {
                      const data = await resp.json();
                      const scenes = data.scenes || [];
                      const sceneOptions = scenes.map((sceneInfo: SceneInfo) => {
                        const scene = sceneInfo.scene || {};
                        const sceneLabel = Object.entries(scene)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ') || '(空)';
                        return {
                          label: sceneLabel,
                          value: JSON.stringify(scene),
                          scene: scene,
                        };
                      });
                      setAvailableScenes(sceneOptions.length > 0 ? sceneOptions : [{ label: '(空)', value: JSON.stringify({}), scene: {} }]);
                    } else {
                      // 如果 API 不存在，使用当前 commit 的场景
                      const sceneOptions = (currentCommit.scenes || []).map((sceneInfo) => {
                        const scene = sceneInfo.scene || {};
                        const sceneLabel = Object.entries(scene)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ') || '(空)';
                        return {
                          label: sceneLabel,
                          value: JSON.stringify(scene),
                          scene: scene,
                        };
                      });
                      setAvailableScenes(sceneOptions.length > 0 ? sceneOptions : [{ label: '(空)', value: JSON.stringify({}), scene: {} }]);
                    }
                  } catch {
                    // 如果查询失败，使用当前 commit 的场景
                    const sceneOptions = (currentCommit.scenes || []).map((sceneInfo) => {
                      const scene = sceneInfo.scene || {};
                      const sceneLabel = Object.entries(scene)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ') || '(空)';
                      return {
                        label: sceneLabel,
                        value: JSON.stringify(scene),
                        scene: scene,
                      };
                    });
                    setAvailableScenes(sceneOptions.length > 0 ? sceneOptions : [{ label: '(空)', value: JSON.stringify({}), scene: {} }]);
                  } finally {
                    setLoadingScenes(false);
                  }
                }}
                options={availableBuildTargets.map((bt) => ({
                  label: bt || '(空)',
                  value: bt,
                }))}
              />
            </div>
            
            <div>
              <Text strong>场景: </Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder={loadingScenes ? '加载中...' : '先选择 Build Target'}
                value={selectedScene}
                onChange={setSelectedScene}
                disabled={!selectedBuildTarget || loadingScenes}
                loading={loadingScenes}
                options={availableScenes}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default CommitsPage;
