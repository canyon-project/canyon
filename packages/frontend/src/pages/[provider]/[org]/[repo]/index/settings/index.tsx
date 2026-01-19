import Icon, { ExperimentOutlined } from '@ant-design/icons';
import { Editor } from '@monaco-editor/react';
import { Button, Card, Form, Input, message, Typography, theme } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
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
  const repoId = repo?.id || '';
  const bu = repo?.bu || '';

  useEffect(() => {
    if (repo?.config) {
      setConfig(repo.config);
    }
  }, [repo]);

  const onFinish = async () => {
    if (!repoId) {
      message.error('仓库 ID 不存在');
      return;
    }

    setLoading(true);
    try {
      const values = form.getFieldsValue() as {
        bu?: string;
        description?: string;
      };

      const resp = await fetch(`/api/repos/${encodeURIComponent(repoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bu: values.bu,
          description: values.description,
        }),
      });

      if (resp.ok) {
        message.success('保存成功');
      } else {
        message.error('保存失败');
      }
    } catch (error) {
      message.error('保存失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSaveConfig = async () => {
    if (!repoId) {
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
      const resp = await fetch(`/api/repos/${encodeURIComponent(repoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          config: config,
        }),
      });

      if (resp.ok) {
        message.success('配置已保存');
      } else {
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
              repoId,
              bu,
              description: repo?.description || '',
            }}
            onFinish={onFinish}
          >
            <Form.Item label={'仓库'} name={'repoPath'}>
              <Input disabled />
            </Form.Item>
            <Form.Item label={'项目 ID'} name={'repoId'}>
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
            <Text type={'secondary'}>后续可接入更多字段</Text>
          </Form>
        </div>

        <div className={'h-5'}></div>
        <Card
          title={
            <div className={'flex items-center'}>
              <ExperimentOutlined
                className={'text-[#687076] mr-2 text-[16px]'}
              />
              <span>{t('projects.config.coverage')}</span>
            </div>
          }
        >
          <div className={'mb-5'}>
            <div className={'mb-2'}>
              <div>{t('projects.default.branch')}</div>
              <Text className={'text-xs'} type={'secondary'}>
                {t('projects.config.default.branch.desc')}
              </Text>
            </div>

            <div className={'mb-5'}>
              <div className={'mb-2'}>
                <div>{t('projects.config.detection.range')}</div>
                <Text className={'text-xs'} type={'secondary'}>
                  {t('projects.config.tooltips')}
                  <a
                    href='https://github.com/isaacs/minimatch'
                    target={'_blank'}
                    rel='noreferrer'
                  >
                    {t('projects.config.minimatch')}
                  </a>
                  <a
                    href='https://github.com/canyon-project/canyon/tree/main/examples/config/coverage.json'
                    target={'_blank'}
                    rel='noreferrer'
                  >
                    {t('projects.config.view.example')}
                  </a>
                  <span className={'ml-2'}>
                    {t('projects.config.example2')}
                  </span>
                </Text>
              </div>
              <div style={{ border: `1px solid ${token.colorBorder}` }}>
                <Editor
                  theme={
                    {
                      light: 'light',
                      dark: 'vs-dark',
                    }[localStorage.getItem('theme') || 'light']
                  }
                  value={config}
                  onChange={(value) => {
                    setConfig(value || '');
                  }}
                  height={'240px'}
                  language={'json'}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                    fontSize: 12,
                    fontFamily: 'IBMPlexMono, monospace',
                    wordWrap: 'wordWrapColumn',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
              <div className={'mt-3'}>
                <Button
                  type={'primary'}
                  onClick={onSaveConfig}
                  loading={configLoading}
                >
                  保存配置
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default RepoSettings;
