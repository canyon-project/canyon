import {
  CloseCircleFilled,
  CloseOutlined,
  CloseSquareOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, Popover, Tag } from 'antd';
import { useState } from 'react';

const ProjectConfigure = () => {
  const [value, setValue] = useState<{ text: string; color: string }[]>([
    {
      color: '#f50',
      text: 'rwed',
    },
  ]);

  const content = (
    <div style={{ width: '300px' }}>
      <Form
        name='basic'
        layout={'vertical'}
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        // style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        autoComplete='off'
      >
        <Form.Item
          label='文本'
          name='username'
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label='颜色'
          name='username'
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
      <div className={'text-right'}>
        <Button size={'small'} type={'primary'}>
          确认
        </Button>
      </div>
    </div>
  );
  return (
    <div>
      {value.map((item, index) => {
        return (
          <Popover content={content} title={false} trigger='click' style={{ width: '300px' }}>
            <Tag color={item.color}>
              {item.text}
              <CloseOutlined className={'cursor-pointer ml-1'} style={{ fontSize: '10px' }} />
            </Tag>
          </Popover>
        );
        // return <Tag color={item.color}>{item.text}</Tag>;
      })}
      <Popover content={content} title={false} trigger='click' style={{ width: '300px' }}>
        <Tag className={'border-dashed cursor-pointer'}>
          <PlusOutlined /> New Tag
        </Tag>
      </Popover>
    </div>
  );
};

export default ProjectConfigure;
