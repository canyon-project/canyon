'use client';

import { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, message, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          remember: values.remember,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        // Redirect or update UI based on successful login
        // For example: router.push('/dashboard');
        // alert("Login successful!")
        localStorage.setItem('token', data.token);

        window.location.href = '/';
      } else {
        console.error('Login failed:', data);
        messageApi.error(data.message);
      }
    } catch (error) {
      console.error('Login request error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      {contextHolder}
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Username"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex items-center justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Forgot password?
            </a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
          >
            Log in
          </Button>
        </Form.Item>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Sign up
          </a>
        </div>
      </Form>
    </Card>
  );
}
