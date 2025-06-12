// import { useQuery } from '@apollo/client';
// import { GetProjectsDocument } from '@/graphql/gen/graphql.ts';
import { Breadcrumb, Button, Divider, Space, Tabs } from 'antd';
import CommitsTab from './CommitsTab';
import { SettingOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import axios from 'axios';
import RIf from '@/components/RIf.tsx';

// 核心代码

const ProjectDetailPage = () => {
  const params = useParams();
  console.log(params, 'params');
  const { data, loading } = useRequest(
    () => {
      return axios
        .get(`/api/repo/${params.org}%2F${params.repo}`)
        .then((res) => res.data);
    },
    {
      refreshDeps: [],
      onSuccess(v) {
        console.log(v);
      },
    },
  );

  return (
    <RIf condition={data}>
      <div className={'h-[48px] flex items-center justify-between px-[16px]'}>
        <Breadcrumb
          items={[
            {
              title: 'Project',
              href: '/projects',
            },
            {
              title: params.repo,
            },
          ]}
        />

        <Space>
          <SettingOutlined />
          <Button type={'primary'} size={'small'}>
            New Project
          </Button>
        </Space>
      </div>
      <Divider style={{ margin: '0' }} />
      <Tabs
        defaultActiveKey="commits"
        items={[
          {
            key: 'commits',
            label: 'Commits',
            children: <CommitsTab repo={data} />,
          },
        ]}
      />
    </RIf>
  );
};

export default ProjectDetailPage;
