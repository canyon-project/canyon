import Icon, { ExperimentOutlined } from '@ant-design/icons';
// import { useMutation } from '@apollo/client/react';
import { Editor } from '@monaco-editor/react';
import { Button, Card, Form, Input, message, Typography, theme } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useParams } from 'react-router-dom';
// import { UpdateRepoDocument } from '@/helpers/backend/gen/graphql';
import { SolarUserIdLinear } from '@/pages/[provider]/[org]/[repo]/index/settings/helpers/icons/SolarUserIdLinear.tsx';

const { Title, Text } = Typography;
const { useToken } = theme;
const RepoSettings = () => {
  const { t } = useTranslation();
  const { token } = useToken();
  const { repo } = useOutletContext<{
    repo: {
      id?: string;
      pathWithNamespace?: string;
      description?: string;
      bu?: string;
      config?: string;
    };
  }>();
  const params = useParams();
  const [form] = Form.useForm();
  const [config, setConfig] = useState<string>(repo?.config || '');

  const repoPath = repo?.pathWithNamespace || `${params.org}/${params.repo}`;
  const repoId = repo?.id || '';
  const bu = repo?.bu || '';

  // const [updateRepo, { loading }] = useMutation(UpdateRepoDocument);

  const onFinish = async () => {
    const values = form.getFieldsValue() as {
      bu?: string;
      description?: string;
    };
  };

  const onSaveConfig = async () => {
    try {
      if (config?.trim()) {
        try {
          JSON.parse(config);
        } catch {
          message.error('配置必须是合法的 JSON');
          return;
        }
      }
      message.success('配置已保存');
    } catch (e: unknown) {
      message.error(String(e) || '保存失败');
    }
  };

  return (
    <div className={'px-[20px] py-[12px] space-y-[12px]'}>
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
                loading={false}
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
                <Button type={'primary'} onClick={onSaveConfig} loading={false}>
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
