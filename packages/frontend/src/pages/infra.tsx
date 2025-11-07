import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BasicLayout from '@/layouts/BasicLayout';

type InfraItem = { name: string; value: string; isEncrypted?: boolean };

type Field = {
  key: string;
  label: string;
  placeholder?: string;
  help?: string;
  secret?: boolean;
};

type FieldGroup = { title: string; description?: string; fields: Field[] };

const GROUPS: FieldGroup[] = [
  {
    title: '站点设置',
    description: '前端基座和后端跨域白名单',
    fields: [
      {
        key: 'VITE_BASE_URL',
        label: '前端基座地址 (VITE_BASE_URL)',
        placeholder: '例如：https://app.example.com',
        help: 'OAuth 回跳会使用该地址作为前端根路径',
      },
      {
        key: 'WHITELISTED_ORIGINS',
        label: '后端跨域白名单 (WHITELISTED_ORIGINS)',
        placeholder: '逗号分隔多个源，例如：https://app.example.com',
        help: '用于后端 CORS 配置，多个用英文逗号分隔',
      },
    ],
  },
  {
    title: '安全',
    description: 'Token 相关配置',
    fields: [
      {
        key: 'JWT_SECRET',
        label: 'JWT 密钥 (JWT_SECRET)',
        placeholder: '随机字符串，越复杂越好',
        secret: true,
      },
    ],
  },
  {
    title: 'GitHub OAuth',
    description: 'GitHub 第三方登录配置',
    fields: [
      { key: 'GITHUB_CLIENT_ID', label: '客户端 ID (GITHUB_CLIENT_ID)' },
      {
        key: 'GITHUB_CLIENT_SECRET',
        label: '客户端密钥 (GITHUB_CLIENT_SECRET)',
        secret: true,
      },
      {
        key: 'GITHUB_SCOPE',
        label: '权限范围 (GITHUB_SCOPE)',
        placeholder: '例如：user:email',
      },
      {
        key: 'GITHUB_CALLBACK_URL',
        label: '回调地址 (GITHUB_CALLBACK_URL)',
        placeholder: '例如：https://app.example.com/auth/github/callback',
      },
    ],
  },
  {
    title: 'GitLab OAuth',
    description: 'GitLab 第三方登录配置（支持自建域名）',
    fields: [
      {
        key: 'GITLAB_BASE_URL',
        label: 'GitLab 基础地址 (GITLAB_BASE_URL)',
        placeholder: '例如：https://gitlab.example.com',
        help: '自建 GitLab 必填；官方为 https://gitlab.com',
      },
      { key: 'GITLAB_CLIENT_ID', label: '客户端 ID (GITLAB_CLIENT_ID)' },
      {
        key: 'GITLAB_CLIENT_SECRET',
        label: '客户端密钥 (GITLAB_CLIENT_SECRET)',
        secret: true,
      },
      {
        key: 'GITLAB_SCOPE',
        label: '权限范围 (GITLAB_SCOPE)',
        placeholder: '例如：api',
      },
      {
        key: 'GITLAB_CALLBACK_URL',
        label: '回调地址 (GITLAB_CALLBACK_URL)',
        placeholder: '例如：https://app.example.com/auth/gitlab/callback',
      },
    ],
  },
];

const InfraSettingsPage: FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/infra-config`, {
          credentials: 'include',
        });
        if (!resp.ok) return;
        const data = (await resp.json()) as Array<InfraItem>;
        const initial: Record<string, string> = {};
        data.forEach((x) => {
          initial[x.name] = x.value ?? '';
        });
        form.setFieldsValue(initial);
      } catch {}
    })();
  }, [form.setFieldsValue]);

  async function onSave(values: Record<string, string>) {
    const items: InfraItem[] = Object.entries(values).map(([name, value]) => ({
      name,
      value: value ?? '',
      isEncrypted: false,
    }));
    const resp = await fetch(`/api/infra-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ items }),
    });
    if (resp.ok) message.success(t('common.saved') || '已保存');
    else message.error(t('common.failed') || '保存失败');
  }

  return (
    <BasicLayout>
      <div className='mb-4'>
        <Typography.Title level={4} style={{ marginBottom: 8 }}>
          {t('settings.infra') || '基础架构配置'}
        </Typography.Title>
        <Typography.Text type='secondary'>
          {t('settings.infra_desc') || '配置 OAuth 与站点运行参数'}
        </Typography.Text>
      </div>

      <Card title='Infra Config' bordered>
        <Form
          form={form}
          layout='vertical'
          onFinish={onSave}
          initialValues={{}}
        >
          {GROUPS.map((g) => (
            <div key={g.title} className='mb-6'>
              <div className='mb-2'>
                <Typography.Text strong>{g.title}</Typography.Text>
                {g.description ? (
                  <Typography.Text type='secondary' className='ml-2'>
                    {g.description}
                  </Typography.Text>
                ) : null}
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {g.fields.map((f) => (
                  <Form.Item
                    key={f.key}
                    label={f.label}
                    name={f.key}
                    help={f.help}
                  >
                    {f.secret ? (
                      <Input.Password placeholder={f.placeholder || ''} />
                    ) : (
                      <Input placeholder={f.placeholder || ''} />
                    )}
                  </Form.Item>
                ))}
              </div>
            </div>
          ))}

          <Space>
            <Button type='primary' htmlType='submit'>
              {t('common.save') || '保存'}
            </Button>
            <Button onClick={() => form.resetFields()}>
              {t('common.reset') || '重置'}
            </Button>
          </Space>
        </Form>
      </Card>
    </BasicLayout>
  );
};

export default InfraSettingsPage;
