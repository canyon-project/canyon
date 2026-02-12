import { CameraOutlined, DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, message, Modal, Popconfirm, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import * as snapshotService from '@/services/snapshot';

export type SnapshotFormValues = {
  repoID: string;
  provider: string;
  sha: string;
  title: string;
  description: string;
};

export type SnapshotRecord = {
  id: string;
  repoID: string;
  provider: string;
  sha: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt?: string;
};

export type SnapshotDrawerProps = {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'records';
  initialValues?: Partial<SnapshotFormValues>;
};

const SnapshotDrawer: FC<SnapshotDrawerProps> = ({
  open,
  onClose,
  mode,
  initialValues,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<SnapshotFormValues>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [records, setRecords] = useState<SnapshotRecord[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SnapshotRecord | null>(null);
  const [editForm] = Form.useForm<{ title: string; description: string }>();
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (open && mode === 'create' && initialValues) {
      form.setFieldsValue({
        repoID: initialValues.repoID ?? '',
        provider: initialValues.provider ?? '',
        sha: initialValues.sha ?? '',
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
      });
    }
  }, [open, mode, initialValues, form]);

  useEffect(() => {
    if (open && mode === 'records' && initialValues?.repoID && initialValues?.provider) {
      fetchRecords();
    }
  }, [open, mode, initialValues?.repoID, initialValues?.provider]);

  const fetchRecords = async () => {
    if (!initialValues?.repoID || !initialValues?.provider) return;
    setRecordsLoading(true);
    try {
      const data = await snapshotService.getSnapshotRecords(
        initialValues.repoID,
        initialValues.provider,
      );
      setRecords(data ?? []);
    } catch {
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const blob = await snapshotService.downloadSnapshot(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `snapshot-${id}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      message.success(t('projects.snapshot.download.success'));
    } catch {
      message.error(t('projects.snapshot.download.failed'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await snapshotService.deleteSnapshot(id);
      message.success(t('projects.snapshot.delete.success'));
      fetchRecords();
    } catch {
      message.error(t('projects.snapshot.delete.failed'));
    }
  };

  const openEdit = (record: SnapshotRecord) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      title: record.title ?? '',
      description: record.description ?? '',
    });
    setEditModalOpen(true);
  };

  const handleEditOk = async () => {
    if (!editingRecord) return;
    const values = await editForm.validateFields().catch(() => null);
    if (values == null) return;
    setEditSaving(true);
    try {
      await snapshotService.updateSnapshot(editingRecord.id, {
        title: values.title,
        description: values.description,
      });
      message.success(t('projects.snapshot.update.success'));
      setEditModalOpen(false);
      setEditingRecord(null);
      fetchRecords();
    } catch {
      message.error(t('projects.snapshot.update.failed'));
    } finally {
      setEditSaving(false);
    }
  };

  const onFinish = async (values: SnapshotFormValues) => {
    setSubmitLoading(true);
    try {
      await snapshotService.createSnapshot({
        repoID: values.repoID,
        provider: values.provider,
        sha: values.sha,
        title: values.title,
        description: values.description,
      });
      message.success(t('projects.snapshot.create.success'));
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      message.error(msg || t('projects.snapshot.create.failed'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const recordsColumns: ColumnsType<SnapshotRecord> = [
    {
      title: t('projects.snapshot.columns.sha'),
      dataIndex: 'sha',
      key: 'sha',
      width: 100,
      ellipsis: true,
      render: (sha: string) => (sha ? sha.substring(0, 7) : '-'),
    },
    {
      title: t('projects.snapshot.columns.title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('projects.snapshot.columns.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('projects.snapshot.columns.status'),
      dataIndex: 'status',
      key: 'status',
      width: 90,
    },
    {
      title: t('common.created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: t('common.option'),
      key: 'action',
      render: (_: unknown, record: SnapshotRecord) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id)}
          >
            {t('projects.snapshot.download.button')}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('projects.snapshot.delete.confirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const title =
    mode === 'create'
      ? t('projects.snapshot.drawer.create')
      : t('projects.snapshot.drawer.records');

  return (
    <Drawer
      title={title}
      placement="right"
      width={'65%'}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      {mode === 'create' ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="repoID"
            label={t('projects.snapshot.form.repoID')}
            rules={[{ required: true, message: t('projects.snapshot.form.repoID.required') }]}
          >
            <Input placeholder={t('projects.snapshot.form.repoID.placeholder')} />
          </Form.Item>
          <Form.Item
            name="provider"
            label={t('projects.snapshot.form.provider')}
            rules={[{ required: true, message: t('projects.snapshot.form.provider.required') }]}
          >
            <Input placeholder={t('projects.snapshot.form.provider.placeholder')} />
          </Form.Item>
          <Form.Item
            name="sha"
            label={t('projects.snapshot.form.sha')}
            rules={[{ required: true, message: t('projects.snapshot.form.sha.required') }]}
          >
            <Input placeholder={t('projects.snapshot.form.sha.placeholder')} />
          </Form.Item>
          <Form.Item
            name="title"
            label={t('projects.snapshot.form.title')}
          >
            <Input placeholder={t('projects.snapshot.form.title.placeholder')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('projects.snapshot.form.description')}
          >
            <Input.TextArea
              rows={3}
              placeholder={t('projects.snapshot.form.description.placeholder')}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitLoading} icon={<CameraOutlined />}>
                {t('projects.snapshot.create.submit')}
              </Button>
              <Button onClick={onClose}>{t('common.cancel')}</Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <>
          <Table<SnapshotRecord>
            size="small"
            columns={recordsColumns}
            dataSource={records}
            rowKey="id"
            loading={recordsLoading}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => t('common.total_items', { total }),
            }}
          />
          <Modal
            title={t('projects.snapshot.edit.title')}
            open={editModalOpen}
            onOk={handleEditOk}
            onCancel={() => {
              setEditModalOpen(false);
              setEditingRecord(null);
            }}
            confirmLoading={editSaving}
            destroyOnClose
          >
            <Form form={editForm} layout="vertical">
              <Form.Item name="title" label={t('projects.snapshot.form.title')}>
                <Input placeholder={t('projects.snapshot.form.title.placeholder')} />
              </Form.Item>
              <Form.Item name="description" label={t('projects.snapshot.form.description')}>
                <Input.TextArea rows={3} placeholder={t('projects.snapshot.form.description.placeholder')} />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </Drawer>
  );
};

export default SnapshotDrawer;
