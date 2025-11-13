import {
  GithubOutlined,
  GitlabOutlined,
  GoogleOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, message, Typography } from 'antd';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LoginPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const apiPrefix = '';

  function toGithub() {
    window.location.href = `${apiPrefix}/auth/github`;
  }

  function toGitlab() {
    window.location.href = `${apiPrefix}/auth/gitlab`;
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-[url(/logo.svg)]/[0.02] bg-no-repeat bg-[length:200px] bg-[position:40px_40px]'>
      <Card
        style={{ width: 760 }}
        bodyStyle={{ padding: 0 }}
        className='shadow-lg'
      >
        <div className='flex'>
          <div className='w-[72px] bg-[#0b5cff] flex items-start justify-center pt-6'>
            <img src='/logo.svg' alt='logo' className='w-[28px] h-[28px]' />
          </div>
          <div className='flex-1 p-8'>
            <Typography.Title level={3} className='!mt-1'>
              {t('login.title') || 'Log in and continue'}
            </Typography.Title>

            <Typography.Text type='secondary'>
              {t('login.signin') || 'Sign in'}
            </Typography.Text>

            <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-8'>
              <Form
                layout='vertical'
                onFinish={async (values: {
                  email: string;
                  password: string;
                }) => {
                  try {
                    const resp = await fetch(`${apiPrefix}/api/user/login`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify(values),
                    });
                    if (!resp.ok) throw new Error('login failed');
                    message.success(t('login.success') || '登录成功');
                    navigate('/');
                  } catch {
                    message.error(t('login.failed') || '登录失败');
                  }
                }}
              >
                <Form.Item
                  label={t('login.email') || 'Email'}
                  name='email'
                  rules={[{ required: true, message: '请输入邮箱' }]}
                >
                  <Input placeholder='Email' />
                </Form.Item>
                <Form.Item
                  label={t('login.password') || 'Password'}
                  name='password'
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password placeholder='Password' />
                </Form.Item>
                <Button type='primary' htmlType='submit' block>
                  {t('login.continue') || 'Continue'}
                </Button>
              </Form>

              <div>
                <Button
                  block
                  size='large'
                  className='mb-3'
                  icon={<GoogleOutlined />}
                  disabled
                >
                  {t('login.google') || 'Sign in with Google'}
                </Button>
                <Button
                  block
                  size='large'
                  className='mb-3'
                  icon={<GithubOutlined />}
                  onClick={toGithub}
                >
                  {t('login.github') || 'Sign in with Github'}
                </Button>
                <Button
                  block
                  size='large'
                  icon={<GitlabOutlined />}
                  onClick={toGitlab}
                >
                  {t('login.gitlab') || 'Sign in with Gitlab'}
                </Button>
              </div>
            </div>

            <Divider className='!my-6' />
            <Typography.Paragraph type='secondary' className='!mb-0'>
              Canyon · {new Date().getFullYear()}
            </Typography.Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
