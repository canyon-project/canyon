import { Editor } from '@monaco-editor/react';
import { Card, Col, Form, Input, Row, Select, Typography } from 'antd';
import { useMemo } from 'react';

const { Title, Text } = Typography;

const PlaygroundPage = () => {
  const [form] = Form.useForm();

  const formValues = Form.useWatch([], form);

  // 实时拼接 URL
  const url = useMemo(() => {
    const baseUrl =
      window.origin +
      `/report/-/${formValues?.provider}/flight-mobile-tools/deepinsight/${formValues?.subject}/${formValues?.subjectID}/-/`;
    const params = new URLSearchParams();

    if (formValues?.buildTarget) {
      params.append('build_target', formValues.buildTarget);
    }
    if (formValues?.scene) {
      try {
        const sceneObj = JSON.parse(formValues.scene);
        params.append('scene', JSON.stringify(sceneObj));
      } catch {
        // 如果 JSON 解析失败，直接使用原值
        params.append('scene', formValues.scene);
      }
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [formValues]);

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <Title level={2}>Coverage Map API Playground</Title>

      <Card title='请求参数' className='mb-4'>
        <Form
          form={form}
          layout='vertical'
          initialValues={{
            subject: 'commit',
            provider: 'gitlab',
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label='Subject'
                name='subject'
                rules={[{ required: true, message: '请选择 subject' }]}
              >
                <Select
                  options={[
                    { label: 'commit', value: 'commit' },
                    { label: 'analysis', value: 'analysis' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label='Provider'
                name='provider'
                rules={[{ required: true, message: '请选择 provider' }]}
              >
                <Select
                  options={[
                    { label: 'gitlab', value: 'gitlab' },
                    { label: 'github', value: 'github' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label='Repo ID'
                name='repoID'
                rules={[{ required: true, message: '请输入 repoID' }]}
              >
                <Input placeholder='例如: 130444' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label='Subject ID'
                name='subjectID'
                rules={[{ required: true, message: '请输入 subjectID' }]}
              >
                <Input placeholder='例如: 7464bb2f31dbaea00a04f162ae9...' />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label='Build Target' name='buildTarget'>
                <Input placeholder='可选，例如: production' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label='Scene (JSON)'
                name='scene'
                tooltip="JSON 格式的 key-value 对象，例如: { 'key1': 'value1', 'key2': 'value2' }"
                initialValue='{}'
              >
                <Editor
                  language='json'
                  height='150px'
                  value={formValues?.scene || '{}'}
                  onChange={(value) => {
                    form.setFieldValue('scene', value || '{}');
                  }}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title='实时 URL'>
        <div className='space-y-2'>
          <Text strong>GET </Text>
          <Text code copyable className='break-all'>
            {url}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default PlaygroundPage;
