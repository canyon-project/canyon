'use client';
import {
  Typography,
  Divider,
  Avatar,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
} from 'antd';
import { DesktopOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function UserSettings() {
  return (
    <div style={{ maxWidth: '800px', padding: '24px', margin: '0 auto' }}>
      <span className="text-[16px] font-bold">User Settings</span>

      {/* Profile Picture Section */}
      <Row
        align="middle"
        justify="space-between"
        style={{ marginBottom: '16px' }}
      >
        <Col>
          <Space direction="vertical" size={4}>
            <Text>Profile Picture</Text>
            <Text type="secondary">You look good today!</Text>
          </Space>
        </Col>
        <Col>
          <Avatar
            size={80}
            src="/placeholder.svg?height=80&width=80"
            style={{ border: '1px solid #f0f0f0' }}
          />
        </Col>
      </Row>

      <Divider style={{ margin: '24px 0' }} />

      {/* Username Section */}
      <Row
        align="middle"
        justify="space-between"
        style={{ marginBottom: '16px' }}
      >
        <Col>
          <Space direction="vertical" size={4}>
            <Text>Username</Text>
            <Text type="secondary">
              Your username can be edited on{' '}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                vercel.com
              </a>
            </Text>
          </Space>
        </Col>
        <Col>
          <Input value="zhangtao25" style={{ width: '300px' }} disabled />
        </Col>
      </Row>

      <Divider style={{ margin: '24px 0' }} />

      {/* Interface Theme Section */}
      <Row
        align="middle"
        justify="space-between"
        style={{ marginBottom: '16px' }}
      >
        <Col>
          <Space direction="vertical" size={4}>
            <Text>Interface theme</Text>
            <Text type="secondary">Select your interface color scheme.</Text>
          </Space>
        </Col>
        <Col>
          <Select
            defaultValue="system"
            style={{ width: '300px' }}
            options={[
              {
                value: 'system',
                label: (
                  <Space>
                    <DesktopOutlined />
                    System
                  </Space>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      <Divider style={{ margin: '24px 0' }} />

      {/* Transfer Data Section */}
      <Row
        align="middle"
        justify="space-between"
        style={{ marginBottom: '16px' }}
      >
        <Col>
          <Space direction="vertical" size={4}>
            <Text>Transfer Data</Text>
            <Text type="secondary">
              Transfer your chats and projects to another Team account or your
              personal scope.
            </Text>
          </Space>
        </Col>
        <Col>
          <Button type="default" size="large">
            Start Transfer
          </Button>
        </Col>
      </Row>
    </div>
  );
}
