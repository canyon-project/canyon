import { useRequest } from 'ahooks';
import { Button, Form, Input, message } from 'antd';
import { FC } from 'react';
const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

type FieldType = {
  companyname?: string;
  username?: string;
  password?: string;
};

const LoginForm: FC<{
  onLoginSuccess: () => void;
}> = ({ onLoginSuccess }) => {
  const { run } = useRequest(
    ({ username, password, companyname }) =>
      fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          companyname: companyname,
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
  const [form] = Form.useForm();
  const onFinish = (values: any) => {
    console.log('Success:', values);
    run({
      companyname: String(values.companyname),
      username: String(values.username),
      password: String(values.password),
    });
  };
  return (
    <Form
      form={form}
      name='basic'
      layout={'vertical'}
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

export default LoginForm;
