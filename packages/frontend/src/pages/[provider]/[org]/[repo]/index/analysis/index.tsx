import { DeleteOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useEffect, useState } from 'react';
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
  from: string;
  to: string;
  subject: string;
  subjectID: string;
  files: DiffFile[];
  buildTargets: string[];
  fromCommit: CommitInfo | null;
  toCommit: CommitInfo | null;
};

const AnalysisPage = () => {
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
        message.error('获取分析记录失败');
      }
    } catch (error) {
      message.error('获取分析记录失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisRecords();
  }, [repo?.id, params.provider]);

  const handleAdd = async (values: { from: string; to: string }) => {
    if (!repo?.id || !params.provider) {
      return;
    }

    const subjectID = `${values.from}...${values.to}`;
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
        message.success('分析记录创建成功');
        setIsModalOpen(false);
        form.resetFields();
        fetchAnalysisRecords();
      } else {
        const errorData = await resp.json();
        message.error(errorData.message || '创建分析记录失败');
      }
    } catch (error) {
      message.error('创建分析记录失败');
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
        message.success('删除成功');
        fetchAnalysisRecords();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
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
      title: 'From (起始 Commit)',
      dataIndex: 'from',
      key: 'from',
      width: 250,
      render: (text: string, record: AnalysisRecord) => {
        const commitInfo = record.fromCommit;
        const shortSha = text.substring(0, 7);
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
            {commitMessage && (
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
      title: 'To (结束 Commit)',
      dataIndex: 'to',
      key: 'to',
      width: 250,
      render: (text: string, record: AnalysisRecord) => {
        const commitInfo = record.toCommit;
        const shortSha = text.substring(0, 7);
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
            {commitMessage && (
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
      title: '文件数量',
      key: 'fileCount',
      width: 100,
      render: (_: any, record: AnalysisRecord) => (
        <Text strong>{record.files?.length || 0}</Text>
      ),
    },
    {
      title: '操作',
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
                默认（无 buildTarget）
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
                  {buildTarget || '(空)'}
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
                查看报告 <DownOutlined />
              </a>
            </Dropdown>
            <Popconfirm
              title='确定要删除这条分析记录吗？'
              onConfirm={() => handleDelete(record)}
              okText='确定'
              cancelText='取消'
            >
              <Button type='link' danger icon={<DeleteOutlined />} size='small'>
                删除
              </Button>
            </Popconfirm>
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
      <div className={'mb-4 flex items-center justify-between'}>
        <div>
          <h2 style={{ margin: 0 }}>分析记录</h2>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            管理 Git commit 之间的分析记录
          </Text>
        </div>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          新增分析
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
            showTotal: (total) => `共 ${total} 条记录`,
            pageSize: 10,
          }}
        />
      </CardPrimary>

      <Modal
        title='新增分析记录'
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
        okText='创建'
        cancelText='取消'
        confirmLoading={addLoading}
        cancelButtonProps={{ disabled: addLoading }}
      >
        <Form form={form} layout='vertical' onFinish={handleAdd}>
          <Form.Item
            name='from'
            label='起始 Commit SHA'
            rules={[
              { required: true, message: '请输入起始 Commit SHA' },
              {
                pattern: /^[a-f0-9]{40}$/i,
                message: 'SHA 格式不正确（应为 40 位十六进制字符串）',
              },
            ]}
          >
            <Input
              placeholder='请输入完整的 40 位 Commit SHA'
              disabled={addLoading}
            />
          </Form.Item>
          <Form.Item
            name='to'
            label='结束 Commit SHA'
            rules={[
              { required: true, message: '请输入结束 Commit SHA' },
              {
                pattern: /^[a-f0-9]{40}$/i,
                message: 'SHA 格式不正确（应为 40 位十六进制字符串）',
              },
            ]}
          >
            <Input
              placeholder='请输入完整的 40 位 Commit SHA'
              disabled={addLoading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnalysisPage;
