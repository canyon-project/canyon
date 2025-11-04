// import { useMutation } from "@apollo/client/apollo-client";
import { useRequest } from 'ahooks';
import axios from 'axios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// import {
//   CheckProjectUrlDocument,
//   CreateProjectDocument,
// } from "@/helpers/backend/gen/graphql.ts";
const { Text } = Typography;

import {
  Button,
  Form,
  Input,
  message,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd';
import BasicLayout from '@/layouts/BasicLayout.tsx';

// import {useMutation} from "@apollo/client/react";

const LabelTest = ({ type, name, url, disabled }) => {
  // const message =
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
  // const [createTodo, { data, loading }] = useMutation(CheckProjectUrlDocument);
  // const [createProject] = useMutation(CreateProjectDocument);
  const [projectID, setProjectID] = useState('');

  const onFinish = (values: any) => {
    const url = gitProviderList.find((i) => {
      return i.id === values.provider;
    }).url;

    // createTodo({
    //   variables: {
    //     projectUrl: `${url}/${values.repository}`,
    //   },
    // }).then((res) => {
    //   setProjectID(
    //     `${values.provider}-${res.data?.checkProjectUrl.id}-${values.slug}`,
    //   );
    // });
  };

  const nav = useNavigate();
  const { t } = useTranslation();
  return (
    <BasicLayout>
      <h2>{t('projects.create')}</h2>

      <h3>1. {t('new.step1')}</h3>
      <Form
        layout={'vertical'}
        form={form}
        name='control-hooks'
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
        initialValues={{
          slug: 'auto',
        }}
      >
        <Form.Item
          name='provider'
          label={t('new.provider')}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={t('new.provider.placeholder')}
            allowClear
            options={(gitProviderList || []).map(
              ({ name, url, type, id, disabled }) => ({
                label: (
                  <LabelTest
                    name={name}
                    type={type}
                    url={url}
                    disabled={disabled}
                  />
                ),
                value: id,
                disabled: disabled,
              }),
            )}
          />
        </Form.Item>
        <Form.Item
          name='repository'
          label={t('new.repository')}
          rules={[{ required: true }]}
        >
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

      <Spin spinning={false}>
        <div>
          <Text>projectID:</Text>
          <Text>{projectID}</Text>
        </div>
        <div>
          <Text>pathWithNamespace:</Text>
          <Text>{'data?.checkProjectUrl.pathWithNamespace'}</Text>
        </div>
        <div>
          <Text>description:</Text>
          <Text>{'data?.checkProjectUrl.description'}</Text>
        </div>
      </Spin>
      <div className={'h-2'}></div>
      <Button type={'primary'} disabled={false} onClick={() => {}}>
        {t('new.create')}
      </Button>
    </BasicLayout>
  );
};

export default App;
