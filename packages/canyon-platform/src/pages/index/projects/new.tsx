import { useMutation } from '@apollo/client';
import { useRequest } from 'ahooks';
import { Alert, Button, Form, Input, Select, Space } from 'antd';
import axios from 'axios';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t('projects.create')}</h2>

      <h3>1. {t('new.step1')}</h3>
      <Form
        layout={'vertical'}
        form={form}
        name='control-hooks'
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name='provider' label={t('new.provider')} rules={[{ required: true }]}>
          <Select
            placeholder={t('new.provider.placeholder')}
            allowClear
            options={(gitProviderList || []).map(({ name, url, type, id, disabled }) => ({
              label: <LabelTest name={name} type={type} url={url} disabled={disabled} />,
              value: id,
              disabled: disabled,
            }))}
          />
        </Form.Item>
        <Form.Item name='repository' label={t('new.repository')} rules={[{ required: true }]}>
          <Input placeholder={'namespace/repo-name'} />
        </Form.Item>

        <Form.Item
          name='slug'
          label={t('projects.slug')}
          rules={[{ required: true, pattern: /^[a-zA-Z0-9]+$/ }]}
          tooltip={<>{t('new.slug.tooltip')}</>}
        >
          <Input placeholder={t('new.slug.placeholder')} />
        </Form.Item>

        <Form.Item name='language' label={t('common.language')} rules={[{ required: true }]}>
          <Select
            placeholder={t('new.language.placeholder')}
            options={[
              {
                label: 'JavaScript',
                value: 'JavaScript',
              },
              {
                label: 'Java',
                value: 'Java',
                disabled: true,
              },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type={'primary'}
            onClick={() => {
              form.submit();
            }}
          >
            {t('new.check')}
          </Button>
        </Form.Item>
      </Form>

      <h3>2. {t('new.step2')}</h3>

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
              language: form.getFieldValue('language'),
            },
          }).then((res) => {
            message.success(JSON.stringify(res.data?.createProject));
            nav(`/projects/${data?.checkProjectUrl.id}/getting-started`);
          });
        }}
      >
        {t('new.create')}
      </Button>
    </div>
  );
};

export default App;
