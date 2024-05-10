import { useMutation } from '@apollo/client';
import { useRequest } from 'ahooks';
import { Alert, Button, Form, Input, Select, Space } from 'antd';
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CheckProjectUrlDocument,
  CreateProjectDocument,
} from '../../../helpers/backend/gen/graphql.ts';

const { Option } = Select;
const { Text } = Typography;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const LabelTest = ({ type, name, url, disabled }) => {
  return (
    <Space>
      <img className={'w-[20px]'} src={`/gitproviders/${type}.svg`} alt='' />
      {name}
      <Text type={'secondary'}>{url}</Text>
    </Space>
  );
};

const App: React.FC = () => {
  const { data: gitProviderList } = useRequest(() =>
    axios.get(`/api/gitprovider`).then(({ data }) => data),
  );
  const [form] = Form.useForm();
  const [createTodo, { data, loading }] = useMutation(CheckProjectUrlDocument);
  const [createProject] = useMutation(CreateProjectDocument);
  const [projectID, setProjectID] = useState('');

  const onFinish = (values: any) => {
    console.log(values);
    console.log(`${values.provider}-${values.repository}-${values.slug}`);
    // setProjectID(`${values.provider}-${values.repository}-${values.slug}`);

    const url = gitProviderList.find((i) => {
      // console.log(i , values.provider)
      return i.id === values.provider;
    }).url;

    createTodo({
      variables: {
        projectUrl: `${url}/${values.repository}`,
      },
    }).then((res) => {
      console.log(res, 'res');
      setProjectID(`${values.provider}-${res.data?.checkProjectUrl.id}-${values.slug}`);
    });
  };

  const nav = useNavigate();

  return (
    <div>
      <h2>创建项目</h2>

      <h3>1. 从源代码创建项目</h3>
      <Form
        layout={'vertical'}
        form={form}
        name='control-hooks'
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name='provider' label='服务提供商' rules={[{ required: true }]}>
          <Select
            placeholder='请选择服务提供商'
            allowClear
            options={(gitProviderList || []).map(({ name, url, type, id, disabled }) => ({
              label: <LabelTest name={name} type={type} url={url} disabled={disabled} />,
              value: id,
              disabled: disabled,
            }))}
          />
        </Form.Item>
        <Form.Item name='repository' label='存储库' rules={[{ required: true }]}>
          <Input placeholder={'namespace/repo-name'} />
        </Form.Item>

        <Form.Item
          name='slug'
          label='项目标识串'
          rules={[{ required: true, pattern: /^[a-zA-Z0-9]+$/ }]}
          tooltip={
            <div
              style={{
                textWrap: 'nowrap',
              }}
            >
              用于结合代码仓库ID生成项目唯一标识
            </div>
          }
        >
          <Input placeholder={'仅支持英文、数字，例如：auto、auto25'} />
        </Form.Item>

        <Form.Item>
          <Button
            type={'primary'}
            onClick={() => {
              form.submit();
            }}
          >
            检查
          </Button>
        </Form.Item>
      </Form>

      <h3>2. 检查你的项目</h3>

      <Spin spinning={loading}>
        <div>
          <Text>projectID:</Text>
          <Text>{projectID}</Text>
        </div>
        <div>
          <Text>pathWithNamespace:</Text>
          <Text>{data?.checkProjectUrl.pathWithNamespace}</Text>
        </div>
        <div>
          <Text>description:</Text>
          <Text>{data?.checkProjectUrl.description}</Text>
        </div>
      </Spin>
      <div className={'h-2'}></div>
      <Button
        type={'primary'}
        disabled={!data?.checkProjectUrl.id}
        onClick={() => {
          createProject({
            variables: {
              projectID: projectID,
            },
          }).then((res) => {
            message.success(JSON.stringify(res.data?.createProject));
            nav(`/projects/${data?.checkProjectUrl.id}/getting-started`);
          });
        }}
      >
        创建
      </Button>
    </div>
  );
};

export default App;
