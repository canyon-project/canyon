import { MailOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Divider, Form, Input, message, Tabs, Typography } from 'antd';

import github from '../../assets/img/github.svg';
import gitlab from '../../assets/img/gitlab.svg';
import google from '../../assets/img/google.svg';
import img from '../../assets/img/img.png';
import { CanyonCardPrimary } from '../card';

const { Title, Text } = Typography;

function run(p) {
  console.log(p, 'run');
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const LoginBtn = ({ oauthUrl }) => {
  return (
    <div className={'flex flex-col gap-3 w-[250px] items-center justify-around py-10 pl-5'}>
      <Button type='default' className={'w-full text-left'} disabled={!oauthUrl.google}>
        <img src={google} alt='' className={'w-[14px] mr-2 mt-[-2px]'} />
        Sign in with Google
      </Button>
      <Button type='default' className={'w-full text-left'} disabled={!oauthUrl.github}>
        <img src={github} alt='' className={'w-[14px] mr-2 mt-[-2px]'} />
        Sign in with Github
      </Button>

      <Button
        type='default'
        className={'w-full text-left'}
        href={oauthUrl.gitlab}
        disabled={!oauthUrl.gitlab}
      >
        <img src={gitlab} alt='' className={'w-[14px] mr-2 mt-[-2px]'} />
        Sign in with Gitlab
      </Button>
      {/*<Button type='default' className={'w-full'}>*/}
      {/*  Sign in with Google*/}
      {/*</Button>*/}
    </div>
  );
};

const LoginForm = ({ onLoginSuccess }) => {
  const { run } = useRequest(
    ({ username, password }) =>
      fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.statusCode >= 400) {
            return Promise.reject(res);
          } else {
            return res;
          }
        }),
    {
      onSuccess: (data) => {
        // console.log(data);
        message.success('登录成功');
        onLoginSuccess();
        localStorage.setItem('token', data.token);
      },
      onError: (error) => {
        console.log(error);
        message.error(error.message);
      },
      manual: true,
    },
  );
  const [form] = Form.useForm(); // Form instance for managing form fields
  const onFinish = (values: any) => {
    console.log('Success:', values);
    run({
      username: String(values.username),
      password: String(values.password),
    });
    // form.resetFields(); // Reset form fields after submission
  };
  return (
    <Form
      form={form}
      name='basic'
      layout={'vertical'}
      // style={{ width: 400 }}
      className={'flex-1 pr-5'}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item<FieldType>
        label='Username'
        name='username'
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input placeholder={'Username or Email'} />
      </Form.Item>

      <Form.Item<FieldType>
        label='Password'
        name='password'
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password placeholder={'Password'} />
      </Form.Item>

      <Form.Item>
        <Button type='primary' htmlType='submit'>
          Continue
        </Button>
      </Form.Item>
    </Form>
  );
};

const CanyonPageLogin = ({ onLoginSuccess, oauthUrl, logo }) => {
  return (
    <div className={'w-full relative'}>
      <div className={'m-auto w-[680px] pt-20'}>
        <CanyonCardPrimary>
          <div className={'flex'}>
            <div className={'bg-blue-950 w-[60px] flex justify-center pt-5'}>
              <Title level={2} className={''} style={{ color: 'white' }}>
                {logo}
              </Title>
            </div>

            <div className={'bg-white flex-1'}>
              <div className={'px-10 pt-5'}>
                <Title level={3}>Log in and continue</Title>
              </div>
              <Tabs
                items={[
                  {
                    label: 'Sign In',
                    key: 'login',
                    children: (
                      <div className={'flex px-10 py-5'}>
                        <LoginForm onLoginSuccess={onLoginSuccess}></LoginForm>
                        <Divider type={'vertical'} style={{ height: '200px' }} />
                        <LoginBtn oauthUrl={oauthUrl} />
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </CanyonCardPrimary>
      </div>

      <div
        className={'absolute top-0 flex flex-wrap h-[100vh] w-full'}
        style={{
          zIndex: '-100',
          backgroundImage: `url(${img})`,
          backgroundSize: '20%',
          opacity: '.5',
        }}
      ></div>
    </div>
  );
};

export default CanyonPageLogin;
