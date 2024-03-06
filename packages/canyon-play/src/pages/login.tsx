import { Divider, Tabs, Tag, Typography } from 'antd';
const { Title, Text } = Typography;
// import React from 'react';
import {
  BorderBottomOutlined,
  ChromeOutlined,
  MailOutlined,
  PicRightOutlined,
  RightSquareOutlined,
  SlackOutlined,
  WindowsOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Checkbox, Form, Input } from 'antd';
import { CanyonCardPrimary } from 'canyon-ui';

import img from '../assets/img.png';
// import {Text} from "echarts/types/src/util/graphic";

const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

const Login = () => {
  useRequest(
    () =>
      fetch(`/api/login`, {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'zhangtao25',
          password: '123456',
        }),
      }),
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );
  return (
    <div className={'w-full relative'}>
      <div className={'m-auto w-[740px] pt-20'}>
        <CanyonCardPrimary>
          <div className={'flex'}>
            <div className={'bg-blue-950 w-[60px] flex justify-center pt-5'}>
              <Title level={2} className={''} style={{ color: 'white' }}>
                A
              </Title>
            </div>

            <div className={'bg-white'}>
              <div className={'px-10 pt-5'}>
                <Title level={3}>Login</Title>
              </div>
              <Tabs
                tabBarExtraContent={
                  <Button type={'link'}>
                    <MailOutlined />
                    邮箱注册
                  </Button>
                }
                style={
                  {
                    // marginLeft: '20px',
                  }
                }
                items={[
                  {
                    label: 'Sign In',
                    key: 'login',
                    children: (
                      <div className={'flex px-10 py-5'}>
                        <Form
                          name='basic'
                          layout={'vertical'}
                          style={{ width: 400 }}
                          initialValues={{ remember: true }}
                          onFinish={onFinish}
                          onFinishFailed={onFinishFailed}
                          autoComplete='off'
                        >
                          <Form.Item<FieldType>
                            label='Username'
                            name='username'
                            rules={[{ required: true, message: 'Please input your username!' }]}
                          >
                            <Input />
                          </Form.Item>

                          <Form.Item<FieldType>
                            label='Password'
                            name='password'
                            rules={[{ required: true, message: 'Please input your password!' }]}
                          >
                            <Input.Password />
                          </Form.Item>

                          <Form.Item>
                            <Button type='primary' htmlType='submit'>
                              Submit
                            </Button>
                          </Form.Item>
                        </Form>

                        <Divider type={'vertical'} style={{ height: '200px' }} />

                        <div className={'flex flex-col gap-3'}>
                          <Button type='default'>Sign in with Google</Button>
                          <Button type='default'>Sign in with Google</Button>
                          <Button type='default'>Sign in with Google</Button>
                        </div>
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

export default Login;
