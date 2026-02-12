import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Form, Input, message, Select, Spin } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import { checkRepo, createRepo } from '@/services/repo';
import { getAxiosErrorMessage } from '@/helpers/api';

type FormValues = {
  repoID: string;
  provider: 'github' | 'gitlab';
};

type RepoCheckResult = {
  repoID: string;
  pathWithNamespace: string;
  description: string;
};

const NewProject = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<RepoCheckResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const handleCheck = async () => {
    const values = await form.validateFields(['repoID', 'provider']).catch(() => null);
    if (!values?.repoID?.trim()) {
      message.warning('请先填写仓库 ID 和来源');
      return;
    }
    setCheckError(null);
    setCheckResult(null);
    setCheckLoading(true);
    try {
      const result = await checkRepo(values.repoID.trim(), values.provider);
      setCheckResult(result as RepoCheckResult);
      message.success('检查成功');
    } catch (e) {
      const msg = getAxiosErrorMessage(e) || '获取仓库信息失败';
      setCheckError(msg);
      message.error(msg);
    } finally {
      setCheckLoading(false);
    }
  };

  const onFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await createRepo({
        repoID: values.repoID.trim(),
        provider: values.provider,
      });
      message.success('创建成功');
      navigate('/projects');
    } catch (e) {
      message.error(getAxiosErrorMessage(e) || '请求失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BasicLayout>
      <Card
        style={{ maxWidth: 520, margin: '0 auto' }}
        title={<span style={{ fontSize: 16, fontWeight: 600 }}>创建仓库</span>}
        extra={
          <Button type="link" onClick={() => navigate('/projects')}>
            返回列表
          </Button>
        }
      >
        <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 24 }}>
          录入仓库 ID 与来源，先检查再创建；检查与创建均由后端通过配置请求 GitLab/GitHub。
        </p>

        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark
        >
          <Form.Item
            name="repoID"
            label="仓库 ID"
            rules={[{ required: true, message: '请输入仓库 ID' }]}
          >
            <Input placeholder="如 118075" />
          </Form.Item>

          <Form.Item
            name="provider"
            label="来源"
            rules={[{ required: true, message: '请选择来源' }]}
            initialValue="gitlab"
          >
            <Select
              placeholder="请选择"
              options={[
                { label: 'GitHub', value: 'github' },
                { label: 'GitLab', value: 'gitlab' },
              ]}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="default"
              icon={<SearchOutlined />}
              onClick={handleCheck}
              loading={checkLoading}
            >
              检查
            </Button>
          </Form.Item>

          {checkLoading && (
            <div style={{ marginTop: 16 }}>
              <Spin tip="正在获取仓库信息..." />
            </div>
          )}

          {checkError && !checkLoading && (
            <Card size="small" style={{ marginTop: 16, borderColor: '#ff4d4f' }}>
              <span style={{ color: '#ff4d4f' }}>{checkError}</span>
            </Card>
          )}

          {checkResult && !checkLoading && (
            <Card size="small" style={{ marginTop: 16 }} title="仓库信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="仓库 ID">
                  {checkResult.repoID}
                </Descriptions.Item>
                <Descriptions.Item label="pathWithNamespace">
                  {checkResult.pathWithNamespace}
                </Descriptions.Item>
                <Descriptions.Item label="描述">
                  {checkResult.description || '—'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              创建
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => navigate('/projects')}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </BasicLayout>
  );
};

export default NewProject;
