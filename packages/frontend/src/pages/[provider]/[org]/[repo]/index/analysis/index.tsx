import { DeleteOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
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

type DiffFile = {
  path: string;
  additions: number[];
  deletions: number[];
};

type CommitInfo = {
  commitMessage: string;
  authorName: string | null;
  authorEmail: string | null;
  createdAt: string;
};

type AnalysisRecord = {
  id: string;
  provider: string;
  repoID: string;
  after: string;
  now: string;
  subject: string;
  subjectID: string;
  files: DiffFile[];
  buildTargets: string[];
  fromCommit: CommitInfo | null;
  toCommit: CommitInfo | null;
};

const AnalysisPage = () => {
  const { t } = useTranslation();
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [analysisRecords, setAnalysisRecords] = useState<AnalysisRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchAnalysisRecords = async () => {
    if (!repo?.id || !params.provider) {
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(
        `/api/code/diff?repoID=${encodeURIComponent(repo.id)}&provider=${encodeURIComponent(params.provider)}`,
        {
          credentials: 'include',
        },
      );

      if (resp.ok) {
        const data = await resp.json();
        setAnalysisRecords(data.data || []);
        setTotal(data.total || 0);
      } else {
        message.error(t('projects.analysis.fetch.failed'));
      }
    } catch (error) {
      message.error(t('projects.analysis.fetch.failed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisRecords();
  }, [repo?.id, params.provider]);

  const handleAdd = async (values: { after: string; now: string }) => {
    if (!repo?.id || !params.provider) {
      return;
    }

    const subjectID = `${values.after}...${values.now}`;
    const subject = 'analysis';

    setAddLoading(true);
    try {
      const resp = await fetch('/api/code/diff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          repoID: repo.id,
          provider: params.provider,
          subject,
          subjectID,
        }),
      });

      if (resp.ok) {
        message.success(t('projects.analysis.create.success'));
        setIsModalOpen(false);
        form.resetFields();
        fetchAnalysisRecords();
      } else {
        const errorData = await resp.json();
        message.error(errorData.message || t('projects.analysis.create.failed'));
      }
    } catch (error) {
      message.error(t('projects.analysis.create.failed'));
      console.error(error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (record: AnalysisRecord) => {
    if (!repo?.id || !params.provider) {
      return;
    }

    try {
      const resp = await fetch(
        `/api/code/diff?subjectID=${encodeURIComponent(record.subjectID)}&subject=${encodeURIComponent(record.subject)}&repoID=${encodeURIComponent(repo.id)}&provider=${encodeURIComponent(params.provider)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (resp.ok) {
        message.success(t('projects.analysis.delete.success'));
        fetchAnalysisRecords();
      } else {
        message.error(t('projects.analysis.delete.failed'));
      }
    } catch (error) {
      message.error(t('projects.analysis.delete.failed'));
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const lng = localStorage.getItem('language') || 'en';
      const localeMap: Record<string, string> = {
        cn: 'zh-CN',
        en: 'en-US',
        ja: 'ja-JP',
      };
      return date.toLocaleString(localeMap[lng] || 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnsType<AnalysisRecord> = [
    {
      title: t('projects.analysis.columns.after'),
      dataIndex: 'after',
      key: 'after',
      width: 250,
      render: (text: string, record: AnalysisRecord) => {
        const commitInfo = record.fromCommit;
        const shortSha = text ? text.substring(0, 7) : '-';
        const commitMessage = commitInfo?.commitMessage
          ? commitInfo.commitMessage.split('\n')[0].substring(0, 60)
          : null;
        const author = commitInfo?.authorName || null;
        const createdAt = commitInfo?.createdAt
          ? formatDate(commitInfo.createdAt)
          : null;

        return (
          <div>
            <Text code style={{ fontSize: '12px' }}>
              {shortSha}
            </Text>
            {commitMessage && commitInfo && (
              <div
                style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}
              >
                <Tooltip title={commitInfo.commitMessage}>
                  {commitMessage}
                  {commitInfo.commitMessage.length > 60 ? '...' : ''}
                </Tooltip>
              </div>
            )}
            {author && (
              <div
                style={{ fontSize: '11px', marginTop: '2px', color: '#999' }}
              >
                {author}
                {createdAt && ` · ${createdAt}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t('projects.analysis.columns.now'),
      dataIndex: 'now',
      key: 'now',
      width: 250,
      render: (text: string, record: AnalysisRecord) => {
        const commitInfo = record.toCommit;
        const shortSha = text ? text.substring(0, 7) : '-';
        const commitMessage = commitInfo?.commitMessage
          ? commitInfo.commitMessage.split('\n')[0].substring(0, 60)
          : null;
        const author = commitInfo?.authorName || null;
        const createdAt = commitInfo?.createdAt
          ? formatDate(commitInfo.createdAt)
          : null;

        return (
          <div>
            <Text code style={{ fontSize: '12px' }}>
              {shortSha}
            </Text>
            {commitMessage && commitInfo && (
              <div
                style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}
              >
                <Tooltip title={commitInfo.commitMessage}>
                  {commitMessage}
                  {commitInfo.commitMessage.length > 60 ? '...' : ''}
                </Tooltip>
              </div>
            )}
            {author && (
              <div
                style={{ fontSize: '11px', marginTop: '2px', color: '#999' }}
              >
                {author}
                {createdAt && ` · ${createdAt}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t('projects.analysis.columns.fileCount'),
      key: 'fileCount',
      width: 100,
      render: (_: any, record: AnalysisRecord) => (
        <Text strong>{record.files?.length || 0}</Text>
      ),
    },
    {
      title: t('projects.analysis.columns.action'),
      key: 'action',
      width: 200,
      render: (_: any, record: AnalysisRecord) => {
        const buildTargets = record.buildTargets || [];

        // 构建菜单项：如果没有 buildTarget，添加一个"默认"选项
        const menuItems: MenuProps['items'] = [];

        if (buildTargets.length === 0) {
          // 如果没有 buildTarget，添加一个"默认"选项
          menuItems.push({
            key: '__default__',
            label: (
              <a
                href={`/report/-/${params.provider}/${params.org}/${params.repo}/analysis/${record.subjectID}/-`}
                target='_blank'
                rel='noreferrer'
              >
                {t('projects.analysis.default.buildTarget')}
              </a>
            ),
          });
        } else {
          // 添加所有 buildTarget 选项
          buildTargets.forEach((buildTarget) => {
            menuItems.push({
              key: buildTarget || '__empty__',
              label: (
                <a
                  href={`/report/-/${params.provider}/${params.org}/${params.repo}/analysis/${record.subjectID}/-?build_target=${encodeURIComponent(buildTarget)}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  {buildTarget || t('projects.analysis.empty.buildTarget')}
                </a>
              ),
            });
          });
        }

        // 统一使用下拉菜单显示
        return (
          <Space>
            <Dropdown menu={{ items: menuItems }} placement='bottomLeft'>
              <a onClick={(e) => e.preventDefault()}>
                {t('projects.analysis.view.report')} <DownOutlined />
              </a>
            </Dropdown>
            <Popconfirm
              title={t('projects.analysis.delete.confirm')}
              onConfirm={() => handleDelete(record)}
              okText={t('projects.analysis.modal.confirm')}
              cancelText={t('projects.analysis.modal.cancel')}
            >
              <Button type='link' danger icon={<DeleteOutlined />} size='small'>
                {t('common.delete')}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  if (!repo) {
    return <div>{t('projects.commits.loading')}</div>;
  }

  return (
    <div className={''}>
      <div className={'mb-4 flex items-center justify-between'}>
        <div>
          <h2 style={{ margin: 0 }}>{t('projects.analysis.title')}</h2>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {t('projects.analysis.desc')}
          </Text>
        </div>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          {t('projects.analysis.add')}
        </Button>
      </div>

      <CardPrimary>
        <Table<AnalysisRecord>
          columns={columns}
          dataSource={analysisRecords}
          loading={loading}
          rowKey='id'
          pagination={{
            total: total,
            showTotal: (total) => t('projects.analysis.pagination.total', { total }),
            pageSize: 10,
          }}
        />
      </CardPrimary>

      <Modal
        title={t('projects.analysis.modal.title')}
        open={isModalOpen}
        onCancel={() => {
          if (!addLoading) {
            setIsModalOpen(false);
            form.resetFields();
          }
        }}
        onOk={() => {
          form.submit();
        }}
        okText={t('projects.analysis.modal.create')}
        cancelText={t('projects.analysis.modal.cancel')}
        confirmLoading={addLoading}
        cancelButtonProps={{ disabled: addLoading }}
      >
        <Form form={form} layout='vertical' onFinish={handleAdd}>
          <Form.Item
            name='after'
            label={t('projects.analysis.form.after.label')}
            rules={[
              { required: true, message: t('projects.analysis.form.after.required') },
              {
                pattern: /^[a-f0-9]{40}$/i,
                message: t('projects.analysis.form.after.invalid'),
              },
            ]}
          >
            <Input
              placeholder={t('projects.analysis.form.after.placeholder')}
              disabled={addLoading}
            />
          </Form.Item>
          <Form.Item
            name='now'
            label={t('projects.analysis.form.now.label')}
            rules={[
              { required: true, message: t('projects.analysis.form.now.required') },
              {
                pattern: /^[a-f0-9]{40}$/i,
                message: t('projects.analysis.form.now.invalid'),
              },
            ]}
          >
            <Input
              placeholder={t('projects.analysis.form.now.placeholder')}
              disabled={addLoading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnalysisPage;
