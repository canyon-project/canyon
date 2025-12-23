import { BranchesOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, message, Space, Switch, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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

const CommitsPage = () => {
  const { t } = useTranslation();
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [commits, setCommits] = useState<CommitRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [onlyDefaultBranch, setOnlyDefaultBranch] = useState(false);
  const [defaultBranch, setDefaultBranch] = useState('');

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
      width: 80,
      render: (_: any, record: CommitRecord) => (
        <Link
          to={`/${params.provider}/${params.org}/${params.repo}/commits/${record.sha}`}
        >
          {t('projects.reported_details')}
        </Link>
      ),
    },
  ];

  if (!repo) {
    return <div>加载中...</div>;
  }

  return (
    <div className={'px-[20px] py-[12px]'}>
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
    </div>
  );
};

export default CommitsPage;
