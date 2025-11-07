import {
  FolderOpenOutlined,
  FolderOutlined,
  GitlabFilled,
  HeartFilled,
  HeartOutlined,
  HeartTwoTone,
  InfoCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  type TableColumnsType,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
// import dayjs = require("dayjs");
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import CardPrimary from '@/components/card/Primary.tsx';
import TextTypography from '@/components/typography/text.tsx';
import {
  CreateRepoDocument,
  DeleteRepoDocument,
  ReposDocument,
  UpdateRepoDocument,
} from '@/helpers/backend/gen/graphql.ts';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const { Text } = Typography;

type ProjectRow = {
  key: string;
  slug: string;
  repo: string;
  bu: string;
  times: number;
  maxCoverage: number;
  latestAt: string;
  tags?: string[];
};

type Repo = {
  id: string;
  name: string;
  pathWithNamespace: string;
  description: string;
  org: string;
  tags: string;
  members: string;
  config: string;
  createdAt: string;
  updatedAt: string;
};

const ProjectPage = () => {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { data: queryData, loading, refetch } = useQuery(ReposDocument);
  const [createRepoMutation] = useMutation(CreateRepoDocument);
  const [updateRepoMutation] = useMutation(UpdateRepoDocument);
  const [deleteRepoMutation] = useMutation(DeleteRepoDocument);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Repo | null>(null);

  // 使用 useQuery 自动请求与加载态；需要时使用 refetch()

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: Repo) {
    setEditing(row);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    await deleteRepoMutation({ variables: { where: { id } } });
    message.success('已删除');
    await refetch();
  }

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      // align:'center',
      render(text, record) {
        return (
          <Space>
            <div
              className={'favor-heart'}
              style={{
                visibility: record.favored ? 'unset' : undefined,
              }}
            >
              {record.favored ? (
                <HeartFilled style={{ color: 'red' }} />
              ) : (
                <HeartOutlined />
              )}
            </div>
            {text}
          </Space>
        );
      },
    },
    // {
    //   title: t("projects.slug"),
    //   dataIndex: "id",
    //   key: "slug",
    //   render(text) {
    //     return (
    //       <span className={"max-w-[80px] block"}>{text.split("-")[2]}</span>
    //     );
    //   },
    // },
    {
      title: t('projects.name'),
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
      render: (text, record) => {
        return (
          <div className={'flex gap-1'}>
            <img
              src='/gitproviders/gitlab.svg'
              alt=''
              className={'mt-1 w-[16px] h-[16px]'}
            />

            <span style={{ width: '4px', display: 'inline-block' }}></span>
            <div className={'flex gap-1 flex-col'}>
              <a
                className={'max-w-[240px]'}
                style={{ color: 'unset' }}
                target={'_blank'}
                // @ts-expect-error
                href={`${window.GITLAB_URL}/${text}`}
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
      sorter: true,
    },
    {
      title: (
        <>
          <Tooltip
            title={t('projects.max_coverage_tooltip')}
            className={'!mr-2'}
          >
            <QuestionCircleOutlined />
          </Tooltip>
          最大{t(`projects.${''}`)}覆盖率
        </>
      ),
      dataIndex: 'maxCoverage',
      key: 'maxCoverage',
      sorter: true,
      render: (text) => {
        return (
          <Space>
            {text}%{90}
          </Space>
        );
      },
    },
    {
      title: t('projects.latest_report_time'),
      dataIndex: 'lastReportTime',
      sorter: true,
      render(_) {
        return <span>{dayjs(_).format('MM-DD HH:mm')}</span>;
      },
    },
    {
      title: t('common.option'),
      key: 'option',
      render: (_, { id }) => (
        <>
          <Link
            to={{
              pathname: `/projects/${id}`,
            }}
          >
            {t('common.detail')}
          </Link>
          <Divider type={'vertical'} />
          <Link
            to={{
              pathname: `/projects/${id}/settings`,
            }}
          >
            {t('common.settings')}
          </Link>
        </>
      ),
    },
  ];
  const data: ProjectRow[] = (queryData?.repos ?? []).map((r) => ({
    id: r.id,
    pathWithNamespace: r.pathWithNamespace,
    description: r.description,
    bu: r.bu,
    times: 0,
    maxCoverage: 0,
    latestAt: new Date(r.updatedAt).toLocaleString(),
    tags: (() => {
      try {
        const arr = JSON.parse(r.tags || '[]');
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })(),
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
          options={[
            { label: '集团营销', value: '集团营销' },
            { label: '商旅', value: '商旅' },
            { label: '门票活动', value: '门票活动' },
          ]}
        />
        <div>
          <Input
            // allowClear
            style={{ width: '420px' }}
            placeholder={t('projects.search_keywords')}
          />
        </div>
        <Space className={'ml-5'}>
          <Text type={'secondary'}>{t('common.favor.only')}: </Text>
          <Switch
            checkedChildren={<HeartFilled />}
            defaultChecked={Boolean(localStorage.getItem('favorOnlyFilter'))}
            onChange={(v) => {}}
          />
        </Space>
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

export default ProjectPage;
