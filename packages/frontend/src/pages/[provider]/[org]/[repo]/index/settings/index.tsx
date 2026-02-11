import Icon, { ExperimentOutlined } from '@ant-design/icons';
import { Editor } from '@monaco-editor/react';
import { Button, Card, Form, Input, message, Typography, theme } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
import { getRepoIDFromId } from '@/helpers/repo';
import { updateRepo } from '@/services/repo';
import { SolarUserIdLinear } from '@/pages/[provider]/[org]/[repo]/index/settings/helpers/icons/SolarUserIdLinear.tsx';

const { Title, Text } = Typography;
const { useToken } = theme;

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

const RepoSettings = () => {
  const { t } = useTranslation();
  const { token } = useToken();
  const { repo } = useOutletContext<{
    repo: Repo | null;
  }>();
  const params = useParams();
  const [form] = Form.useForm();
  const [config, setConfig] = useState<string>(repo?.config || '');
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);

  const repoPath = repo?.pathWithNamespace || `${params.org}/${params.repo}`;
  const repoID = getRepoIDFromId(repo?.id);
  const bu = repo?.bu || '';

  useEffect(() => {
    if (repo?.config) {
      setConfig(repo.config);
    }
  }, [repo]);

  const onFinish = async () => {
    if (!repoID) {
      message.error('仓库 ID 不存在');
      return;
    }

    setLoading(true);
    try {
      const values = form.getFieldsValue() as { bu?: string; description?: string };
      await updateRepo(repoID, { bu: values.bu, description: values.description });
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSaveConfig = async () => {
    if (!repoID) {
      message.error('仓库 ID 不存在');
      return;
    }

    try {
      if (config?.trim()) {
        try {
          JSON.parse(config);
        } catch {
          message.error('配置必须是合法的 JSON');
          return;
        }
      }

      setConfigLoading(true);
      try {
        await updateRepo(repoID, { config });
        message.success('配置已保存');
      } catch {
        message.error('保存失败');
      }
    } catch (e: unknown) {
      message.error(String(e) || '保存失败');
    } finally {
      setConfigLoading(false);
    }
  };

  if (!repo) {
    return <div>加载中...</div>;
  }

  return (
    <div className={' space-y-[12px]'}>
      <Card title={'项目设置'}>
        <div className={'space-y-[12px]'}>
          <Title level={5} className={'flex items-center gap-1'}>
            <Icon style={{ fontSize: '20px' }} component={SolarUserIdLinear} />
            基础信息
          </Title>
          <Form
            form={form}
            layout={'vertical'}
            initialValues={{
              repoPath,
              repoID,
              bu,
              description: repo?.description || '',
            }}
            onFinish={onFinish}
          >
            <Form.Item label={'仓库'} name={'repoPath'}>
              <Input disabled />
            </Form.Item>
            <Form.Item label={'项目 ID'} name={'repoID'}>
              <Input disabled />
            </Form.Item>
            <Form.Item label={'Bu'} name={'bu'}>
              <Input placeholder={'请输入 Bu'} />
            </Form.Item>
            <Form.Item label={'描述'} name={'description'}>
              <Input.TextArea rows={4} placeholder={'请输入项目描述'} />
            </Form.Item>

            <Form.Item>
              <Button
                type={'primary'}
                onClick={() => form.submit()}
                loading={loading}
              >
                保存更改
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default RepoSettings;
