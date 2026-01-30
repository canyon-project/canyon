import { FolderOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Input,
  message,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CardPrimary from '@/components/card/Primary.tsx';
import TextTypography from '@/components/typography/text.tsx';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const { Text } = Typography;

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
  org: string;
  bu: string;
  tags: string;
  members: string;
  config: string;
  createdAt: string;
  updatedAt: string;
  favored?: boolean;
  reportTimes?: number;
  maxCoverage?: number;
  lastReportTime?: string;
  provider: string;
};

type ProjectRow = {
  key: string;
  id: string;
  slug: string;
  repo: string;
  bu: string;
  times: number;
  maxCoverage: number;
  latestAt: string;
  tags?: string[];
  pathWithNamespace: string;
  description: string;
  favored?: boolean;
  reportTimes?: number;
  lastReportTime?: string;
  provider: string;
};

const Projects = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [buOptions, setBuOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedBu, setSelectedBu] = useState<string | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 获取所有 Bu 选项
  const fetchBuOptions = async () => {
    try {
      const resp = await fetch('/api/repos/bu', {
        credentials: 'include',
      });
      if (resp.ok) {
        const data = await resp.json();
        setBuOptions(
          data.map((bu: string) => ({
            label: bu,
            value: bu,
          })),
        );
      }
    } catch (error) {
      console.error('获取 Bu 选项失败', error);
    }
  };

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBu) {
        params.append('bu', selectedBu);
      }
      if (searchKeyword) {
        params.append('search', searchKeyword);
      }

      const url = `/api/repos${params.toString() ? `?${params.toString()}` : ''}`;
      const resp = await fetch(url, {
        credentials: 'include',
      });
      if (resp.ok) {
        const data = await resp.json();
        setRepos(data || []);
      } else {
        message.error('获取项目列表失败');
      }
    } catch (error) {
      message.error('获取项目列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuOptions();
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [selectedBu]);

  const handleDelete = async (id: string) => {
    try {
      const resp = await fetch(`/api/repos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (resp.ok || resp.status === 204) {
        message.success('已删除');
        await fetchRepos();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const columns: ColumnsType<ProjectRow> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render(text, record) {
        return (
          <Space>
            {/*<div*/}
            {/*  className={'favor-heart'}*/}
            {/*  style={{*/}
            {/*    visibility: record.favored ? 'unset' : undefined,*/}
            {/*  }}*/}
            {/*>*/}
            {/*  {record.favored ? (*/}
            {/*    <HeartFilled style={{ color: 'red' }} />*/}
            {/*  ) : (*/}
            {/*    <HeartOutlined />*/}
            {/*  )}*/}
            {/*</div>*/}
            {text}
          </Space>
        );
      },
    },
    {
      title: t('projects.name'),
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
      render: (text, record) => {
        // 根据 provider 选择对应的 logo
        const logoPath =
          record.provider === 'github'
            ? '/gitproviders/github.svg'
            : '/gitproviders/gitlab.svg';

        return (
          <div className={'flex gap-1'}>
            <img
              src={logoPath}
              alt=''
              className={'mt-1 w-[16px] h-[16px]'}
            />

            <span style={{ width: '4px', display: 'inline-block' }}></span>
            <div className={'flex gap-1 flex-col'}>
              <a
                className={'max-w-[240px]'}
                style={{ color: 'unset' }}
                target={'_blank'}
                rel='noreferrer'
              >
                {text}
              </a>
              <Text
                type={'secondary'}
                style={{ fontSize: '12px', width: '240px' }}
              >
                {record.description}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Bu',
      dataIndex: 'bu',
      sorter: true,
    },
    {
      title: t('projects.report_times'),
      dataIndex: 'reportTimes',
      sorter: {
        compare: (a, b) => {
          const aValue = a.reportTimes || 0;
          const bValue = b.reportTimes || 0;
          return aValue - bValue;
        },
        multiple: 1,
      },
      render: (text) => text || 0,
    },
    // {
    //   title: (
    //     <>
    //       <Tooltip
    //         title={t('projects.max_coverage_tooltip')}
    //         className={'!mr-2'}
    //       >
    //         <QuestionCircleOutlined />
    //       </Tooltip>
    //       最大{t(`projects.${''}`)}覆盖率
    //     </>
    //   ),
    //   dataIndex: 'maxCoverage',
    //   key: 'maxCoverage',
    //   sorter: true,
    //   render: (text) => {
    //     return (
    //       <Space>
    //         {text || 0}%{90}
    //       </Space>
    //     );
    //   },
    // },
    {
      title: t('projects.latest_report_time'),
      dataIndex: 'lastReportTime',
      sorter: {
        compare: (a, b) => {
          const aValue = a.lastReportTime
            ? new Date(a.lastReportTime).getTime()
            : 0;
          const bValue = b.lastReportTime
            ? new Date(b.lastReportTime).getTime()
            : 0;
          return aValue - bValue;
        },
        multiple: 2,
      },
      render(_) {
        if (!_) return '-';
        return <span>{dayjs(_).format('MM-DD HH:mm')}</span>;
      },
    },
    {
      title: t('common.option'),
      key: 'option',
      render: (_, record) => {
        // 从 pathWithNamespace 解析出 org 和 repo
        // pathWithNamespace 格式通常是 "org/repo" 或 "group/org/repo"
        const parts = record.pathWithNamespace.split('/');
        const org = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
        const repo = parts[parts.length - 1];
        // 使用 record 中的 provider
        const provider = record.provider;

        return (
          <>
            <Link
              to={{
                pathname: `/${provider}/${org}/${repo}/analysis`,
              }}
            >
              {t('common.detail')}
            </Link>
            <Divider type={'vertical'} />
            <Link
              to={{
                pathname: `/${provider}/${org}/${repo}/settings`,
              }}
            >
              {t('common.settings')}
            </Link>
          </>
        );
      },
    },
  ];

  const data: ProjectRow[] = repos.map((r) => ({
    key: r.id,
    id: r.id,
    pathWithNamespace: r.pathWithNamespace,
    description: r.description,
    bu: r.bu,
    slug: r.id,
    repo: r.pathWithNamespace,
    times: r.reportTimes || 0,
    maxCoverage: r.maxCoverage || 0,
    latestAt: r.lastReportTime || '',
    tags: (() => {
      try {
        const arr = JSON.parse(r.tags || '[]');
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })(),
    favored: r.favored,
    reportTimes: r.reportTimes,
    lastReportTime: r.lastReportTime,
    provider: r.provider,
  }));

  return (
    <BasicLayout>
      <TextTypography
        title={t('menus.projects')}
        icon={<FolderOutlined />}
        right={
          <Link to={`/projects/new`}>
            <Button type={'primary'} icon={<PlusOutlined />}>
              {t('projects.create')}
            </Button>
          </Link>
        }
      />

      <div className='mb-4 flex items-center gap-3'>
        <Select
          allowClear
          placeholder='Bu'
          style={{ width: 160 }}
          value={selectedBu}
          onChange={(value) => setSelectedBu(value)}
          options={buOptions}
        />
        <div>
          <Input
            style={{ width: '420px' }}
            placeholder={t('projects.search_keywords')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={() => fetchRepos()}
            allowClear
            onClear={() => {
              setSearchKeyword('');
              // 延迟执行以确保 searchKeyword 已清空
              setTimeout(() => fetchRepos(), 0);
            }}
          />
        </div>
        {/*<Space className={'ml-5'}>*/}
        {/*  <Text type={'secondary'}>{t('common.favor.only')}: </Text>*/}
        {/*  <Switch*/}
        {/*    checkedChildren={<HeartFilled />}*/}
        {/*    defaultChecked={Boolean(localStorage.getItem('favorOnlyFilter'))}*/}
        {/*    onChange={(v) => {*/}
        {/*      if (v) {*/}
        {/*        localStorage.setItem('favorOnlyFilter', 'true');*/}
        {/*      } else {*/}
        {/*        localStorage.removeItem('favorOnlyFilter');*/}
        {/*      }*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</Space>*/}
      </div>
      <CardPrimary>
        <Table<ProjectRow>
          showSorterTooltip={false}
          rowKey='id'
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered={false}
          pagination={{ pageSize: 10 }}
        />
      </CardPrimary>
    </BasicLayout>
  );
};

export default Projects;
