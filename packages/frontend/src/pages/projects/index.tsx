import {
  FolderOpenOutlined,
  GitlabFilled,
  HeartTwoTone,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client/react';
import type { TableColumnsType } from 'antd';
import {
  Button,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CreateRepoDocument,
  DeleteRepoDocument,
  ReposDocument,
  UpdateRepoDocument,
} from '@/helpers/backend/gen/graphql.ts';
import BasicLayout from '@/layouts/BasicLayout.tsx';

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

  const columns: TableColumnsType<ProjectRow> = [
    {
      title: 'ID',
      dataIndex: 'slug',
      width: 240,
      render: (value: string) => (
        <Space size={8}>
          <HeartTwoTone twoToneColor='#eb2f96' />
          <span className='font-medium'>{value}</span>
        </Space>
      ),
    },
    {
      title: t('projects.name'),
      dataIndex: 'repo',
      render: (value: string, row) => (
        <Space size={8}>
          <GitlabFilled className='text-[#e24329]' />
          <div className='flex flex-col'>
            <Typography.Link className='text-[14px]' href='/projects'>
              {value}
            </Typography.Link>
            {row.tags?.length ? (
              <div className='mt-1 flex gap-1 flex-wrap'>
                {row.tags.map((x) => (
                  <Tag key={x} color='blue' bordered={false} className='m-0'>
                    {x}
                  </Tag>
                ))}
              </div>
            ) : null}
          </div>
        </Space>
      ),
    },
    {
      title: t('common.bu'),
      dataIndex: 'bu',
      width: 120,
    },
    {
      title: t('projects.report_times'),
      dataIndex: 'times',
      width: 100,
    },
    {
      title: (
        <Space size={4}>
          <span>{t('projects.max_coverage')}</span>
          <Tooltip title={t('projects.max_coverage_tooltip')}>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'maxCoverage',
      width: 160,
      render: (num: number) => (
        <span className='font-medium'>{num.toFixed(2)} %</span>
      ),
    },
    {
      title: t('projects.latest_report_time'),
      dataIndex: 'latestAt',
      width: 160,
    },
    {
      title: t('common.option'),
      key: 'action',
      width: 200,
      render: (_: unknown, record) => (
        <Space size={16}>
          <Button
            type='link'
            onClick={() =>
              openEdit({
                id: record.slug,
                name: record.repo,
                pathWithNamespace: record.repo,
                description: '',
                org: record.bu,
                tags: '[]',
                members: '[]',
                config: '{}',
                createdAt: '',
                updatedAt: '',
              })
            }
          >
            编辑
          </Button>
          <Popconfirm
            title='确认删除？'
            onConfirm={() => handleDelete(record.slug)}
          >
            <Button type='link' danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const data: ProjectRow[] = (queryData?.repos ?? []).map((r) => ({
    key: r.id,
    slug: r.id,
    repo: r.pathWithNamespace,
    bu: r.org,
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
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2'>
          <FolderOpenOutlined className='text-[20px]' />
          <Typography.Title level={3} className='!m-0'>
            {t('menus.projects')}
          </Typography.Title>
        </div>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => nav(`/projects/new`)}
        >
          {t('projects.create')}
        </Button>
      </div>

      <div className='mb-4 flex flex-wrap items-center gap-3'>
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
        <Select
          allowClear
          placeholder='Tag'
          style={{ width: 200 }}
          options={[{ label: '云梯', value: '云梯' }]}
        />
        <Input.Search
          allowClear
          className='flex-1 min-w-[240px]'
          placeholder={t('projects.search_keywords')}
        />
        <div className='flex items-center gap-2 ml-auto'>
          <Switch />
          <span className='text-[12px] text-gray-500'>
            {t('common.favor.only')}
          </span>
        </div>
      </div>

      <Table<ProjectRow>
        rowKey='key'
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <EditRepoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        repo={editing}
        onOk={async (values) => {
          if (editing) {
            await updateRepoMutation({
              variables: { where: { id: editing.id }, input: values },
            });
            message.success('已更新');
          } else {
            await createRepoMutation({ variables: { input: values } });
            message.success('已创建');
          }
          setModalOpen(false);
          await refetch();
        }}
      />
    </BasicLayout>
  );
};

type EditRepoModalProps = {
  open: boolean;
  onClose: () => void;
  repo: Repo | null;
  onOk: (values: {
    id: string;
    name: string;
    pathWithNamespace: string;
    description: string;
    org: string;
    tags: string;
    members: string;
    config: string;
  }) => Promise<void>;
};

const EditRepoModal = ({ open, onClose, repo, onOk }: EditRepoModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        repo || {
          id: '',
          name: '',
          pathWithNamespace: '',
          description: '',
          org: '',
          tags: '[]',
          members: '[]',
          config: '{}',
        },
      );
    }
  }, [open, repo, form.setFieldsValue]);

  return (
    <Modal
      open={open}
      title={repo ? '编辑项目' : '创建项目'}
      onCancel={onClose}
      onOk={async () => {
        const values = await form.validateFields();
        await onOk(values);
      }}
      destroyOnHidden
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          label='ID'
          name='id'
          rules={[{ required: !repo, message: '请输入项目ID' }]}
        >
          <Input disabled={!!repo} />
        </Form.Item>
        <Form.Item
          label='名称'
          name='name'
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='仓库路径'
          name='pathWithNamespace'
          rules={[{ required: true, message: '请输入仓库路径' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label='描述' name='description'>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label='BU' name='org'>
          <Input />
        </Form.Item>
        <Form.Item label='标签(JSON)' name='tags' tooltip='例如：["云梯"]'>
          <Input />
        </Form.Item>
        <Form.Item label='成员(JSON)' name='members'>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item label='配置(JSON)' name='config'>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectPage;
