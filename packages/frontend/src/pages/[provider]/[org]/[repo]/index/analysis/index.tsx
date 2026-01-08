import { ArrowRightOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Drawer, Form, Input, message, Select, Space, Switch, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';

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
};

type AnalysisRecord = {
  id: string; // after...now
  afterCommit: string;
  nowCommit: string;
  afterCommitMessage: string;
  nowCommitMessage: string;
  commits: Array<{
    sha: string;
    message: string;
  }>; // 两个 commit 之间的所有 commit
};

const AnalysisPage = () => {
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [afterCommit, setAfterCommit] = useState<string>('');
  const [nowCommit, setNowCommit] = useState<string>('');
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [drawerSearchKeyword, setDrawerSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [defaultBranch, setDefaultBranch] = useState('');
  const [drawerOnlyDefaultBranch, setDrawerOnlyDefaultBranch] = useState(false);
  const [commitsLoading, setCommitsLoading] = useState(false);

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

  // 获取 commit 列表（用于创建分析时的选择）
  const fetchCommits = async () => {
    if (!repo?.id) {
      return;
    }

    setCommitsLoading(true);
    try {
      const requestParams = new URLSearchParams({
        repoID: repo.id,
        page: '1',
        pageSize: '100', // 获取更多用于选择
      });

      if (drawerSearchKeyword) {
        requestParams.append('search', drawerSearchKeyword);
      }

      if (drawerOnlyDefaultBranch && defaultBranch) {
        requestParams.append('defaultBranch', defaultBranch);
      }

      const resp = await fetch(`/api/coverage/commits?${requestParams.toString()}`, {
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
      setCommitsLoading(false);
    }
  };

  // 获取分析列表（暂时使用模拟数据）
  const fetchAnalyses = async () => {
    if (!repo?.id) {
      return;
    }

    setLoading(true);
    try {
      // TODO: 如果有后端 API，在这里调用
      // const resp = await fetch(`/api/coverage/analyses?repoID=${repo.id}&page=${page}&pageSize=${pageSize}`, {
      //   credentials: 'include',
      // });
      // if (resp.ok) {
      //   const data = await resp.json();
      //   setAnalyses(data.data || []);
      //   setTotal(data.total || 0);
      // }

      // 模拟数据
      await new Promise((resolve) => setTimeout(resolve, 300));
      const mockData: AnalysisRecord[] = [
        {
          id: 'a1b2c3d...e5f6g7h',
          afterCommit: 'a1b2c3d',
          nowCommit: 'e5f6g7h',
          afterCommitMessage: '修复登录bug',
          nowCommitMessage: '添加新功能模块',
          commits: [
            { sha: 'a1b2c3d', message: '修复登录bug' },
            { sha: 'b2c3d4e', message: '优化性能' },
            { sha: 'c3d4e5f', message: '更新依赖' },
            { sha: 'd4e5f6g', message: '重构代码结构' },
            { sha: 'e5f6g7h', message: '添加新功能模块' },
          ],
        },
        {
          id: 'f7g8h9i...j0k1l2m',
          afterCommit: 'f7g8h9i',
          nowCommit: 'j0k1l2m',
          afterCommitMessage: '初始化项目',
          nowCommitMessage: '完成用户认证',
          commits: [
            { sha: 'f7g8h9i', message: '初始化项目' },
            { sha: 'g8h9i0j', message: '添加基础配置' },
            { sha: 'h9i0j1k', message: '实现用户注册' },
            { sha: 'i0j1k2l', message: '实现用户登录' },
            { sha: 'j0k1l2m', message: '完成用户认证' },
          ],
        },
        {
          id: 'm3n4o5p...q6r7s8t',
          afterCommit: 'm3n4o5p',
          nowCommit: 'q6r7s8t',
          afterCommitMessage: '修复API错误',
          nowCommitMessage: '添加单元测试',
          commits: [
            { sha: 'm3n4o5p', message: '修复API错误' },
            { sha: 'n4o5p6q', message: '改进错误处理' },
            { sha: 'o5p6q7r', message: '添加日志记录' },
            { sha: 'p6q7r8s', message: '优化代码质量' },
            { sha: 'q6r7s8t', message: '添加单元测试' },
          ],
        },
      ];

      // 根据搜索关键词过滤
      const filtered = searchKeyword
        ? mockData.filter(
            (item) =>
              item.afterCommit.includes(searchKeyword) ||
              item.nowCommit.includes(searchKeyword) ||
              item.afterCommitMessage.includes(searchKeyword) ||
              item.nowCommitMessage.includes(searchKeyword),
          )
        : mockData;

      setAnalyses(filtered);
      setTotal(filtered.length);
    } catch (error) {
      message.error('获取分析列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [repo?.id, page, pageSize, searchKeyword]);

  // 当抽屉打开时，获取 commits 列表
  useEffect(() => {
    if (drawerOpen) {
      fetchCommits();
    }
  }, [drawerOpen, drawerSearchKeyword, drawerOnlyDefaultBranch, defaultBranch]);

  // 处理创建分析
  const handleCreateAnalysis = () => {
    if (!afterCommit || !nowCommit) {
      message.warning('请选择两个 commit');
      return;
    }

    if (afterCommit === nowCommit) {
      message.warning('两个 commit 不能相同');
      return;
    }

    // 跳转到报告页面
    const subjectID = `${afterCommit}...${nowCommit}`;
    navigate(`/report/-/${params.provider}/${params.org}/${params.repo}/analysis/${subjectID}/-`);
  };

  // 生成 commit 选项
  const commitOptions = commits.map((commit) => ({
    label: (
      <Space>
        <Text code style={{ fontSize: '12px' }}>
          {commit.sha.substring(0, 7)}
        </Text>
        <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
          {commit.commitMessage || '(无提交信息)'}
        </Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {commit.branch}
        </Text>
      </Space>
    ),
    value: commit.sha,
  }));

  if (!repo) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '0 4px' }}>
      <div className={'mb-4 flex items-center justify-between'}>
        <div className="flex items-center gap-3">
          <Input
            style={{ width: '600px' }}
            placeholder="搜索分析记录"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchAnalyses();
            }}
            allowClear
            onClear={() => {
              setSearchKeyword('');
              setPage(1);
            }}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setDrawerOpen(true);
            form.resetFields();
            setAfterCommit('');
            setNowCommit('');
            setDrawerSearchKeyword('');
            setDrawerOnlyDefaultBranch(false);
          }}
        >
          创建分析
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {analyses.length === 0 && !loading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <Text type="secondary">暂无分析记录</Text>
              <br />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginTop: 16 }}
                onClick={() => {
                  setDrawerOpen(true);
                  form.resetFields();
                  setAfterCommit('');
                  setNowCommit('');
                  setDrawerSearchKeyword('');
                  setDrawerOnlyDefaultBranch(false);
                }}
              >
                创建分析
              </Button>
            </div>
          </Card>
        ) : (
          analyses.map((item) => (
            <Card
              key={item.id}
              hoverable
              style={{
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {/* Commit Range Header */}
                  <div style={{ marginBottom: 16 }}>
                    <Space size="middle" align="center">
                      <Link
                        to={`/${params.provider}/${params.org}/${params.repo}/commits/${item.afterCommit}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Tag
                          color="blue"
                          style={{
                            padding: '4px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            borderRadius: 6,
                            border: 'none',
                          }}
                        >
                          <Text code style={{ fontSize: '13px', fontWeight: 600 }}>
                            {item.afterCommit}
                          </Text>
                        </Tag>
                      </Link>
                      <ArrowRightOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />
                      <Link
                        to={`/${params.provider}/${params.org}/${params.repo}/commits/${item.nowCommit}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Tag
                          color="green"
                          style={{
                            padding: '4px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            borderRadius: 6,
                            border: 'none',
                          }}
                        >
                          <Text code style={{ fontSize: '13px', fontWeight: 600 }}>
                            {item.nowCommit}
                          </Text>
                        </Tag>
                      </Link>
                    </Space>
                  </div>

                  {/* Commit Messages */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: '12px', marginRight: 8 }}>
                        After:
                      </Text>
                      <Text style={{ fontSize: '14px' }}>{item.afterCommitMessage}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', marginRight: 8 }}>
                        Now:
                      </Text>
                      <Text style={{ fontSize: '14px' }}>{item.nowCommitMessage}</Text>
                    </div>
                  </div>

                  {/* Included Commits */}
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#fafafa',
                      borderRadius: 6,
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        包含的 Commits ({item.commits.length} 个)
                      </Text>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {item.commits.map((commit, index) => {
                        const isFirst = index === 0;
                        const isLast = index === item.commits.length - 1;
                        return (
                          <Link
                            key={commit.sha}
                            to={`/${params.provider}/${params.org}/${params.repo}/commits/${commit.sha}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Tag
                              color={isFirst ? 'blue' : isLast ? 'green' : 'default'}
                              style={{
                                margin: 0,
                                padding: '4px 10px',
                                fontSize: '12px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: isFirst || isLast ? 'none' : '1px solid #d9d9d9',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <Text
                                code
                                style={{
                                  fontSize: '11px',
                                  fontWeight: isFirst || isLast ? 600 : 400,
                                  color: isFirst || isLast ? '#fff' : 'inherit',
                                }}
                              >
                                {commit.sha.substring(0, 7)}
                              </Text>
                              <Text
                                style={{
                                  fontSize: '11px',
                                  marginLeft: 6,
                                  color: isFirst || isLast ? '#fff' : '#666',
                                }}
                              >
                                {commit.message}
                              </Text>
                            </Tag>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ marginLeft: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      const subjectID = `${item.afterCommit}...${item.nowCommit}`;
                      navigate(
                        `/report/-/${params.provider}/${params.org}/${params.repo}/analysis/${subjectID}/-`,
                      );
                    }}
                    style={{
                      borderRadius: 6,
                      fontWeight: 500,
                    }}
                  >
                    查看详情
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}

        {/* Pagination */}
        {analyses.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Space>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                共 {total} 条
              </Text>
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <Text>{page}</Text>
              <Button
                disabled={page * pageSize >= total}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </Space>
          </div>
        )}
      </div>

      <Drawer
        title="创建分析"
        placement="right"
        width={600}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
          setAfterCommit('');
          setNowCommit('');
          setDrawerSearchKeyword('');
          setDrawerOnlyDefaultBranch(false);
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAnalysis}
        >
          <div className="mb-4">
            <Input
              style={{ width: '100%' }}
              placeholder="搜索 commit SHA 或提交信息"
              prefix={<SearchOutlined />}
              value={drawerSearchKeyword}
              onChange={(e) => {
                setDrawerSearchKeyword(e.target.value);
              }}
              allowClear
            />
            {defaultBranch && (
              <Space style={{ marginTop: 8 }}>
                <Text type="secondary">仅默认分支:</Text>
                <Switch
                  checked={drawerOnlyDefaultBranch}
                  onChange={(checked) => {
                    setDrawerOnlyDefaultBranch(checked);
                  }}
                />
              </Space>
            )}
          </div>

          <Form.Item
            label="After Commit (起始 commit)"
            name="afterCommit"
            rules={[{ required: true, message: '请选择 after commit' }]}
          >
            <Select
              placeholder="选择 after commit"
              showSearch
              filterOption={false}
              loading={commitsLoading}
              options={commitOptions}
              value={afterCommit}
              onChange={(value) => {
                setAfterCommit(value);
                form.setFieldsValue({ afterCommit: value });
              }}
              notFoundContent={commitsLoading ? '加载中...' : '暂无数据'}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Now Commit (目标 commit)"
            name="nowCommit"
            rules={[
              { required: true, message: '请选择 now commit' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('afterCommit') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两个 commit 不能相同'));
                },
              }),
            ]}
          >
            <Select
              placeholder="选择 now commit"
              showSearch
              filterOption={false}
              loading={commitsLoading}
              options={commitOptions}
              value={nowCommit}
              onChange={(value) => {
                setNowCommit(value);
                form.setFieldsValue({ nowCommit: value });
              }}
              notFoundContent={commitsLoading ? '加载中...' : '暂无数据'}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!afterCommit || !nowCommit}
              >
                查看分析报告
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  setAfterCommit('');
                  setNowCommit('');
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AnalysisPage;
