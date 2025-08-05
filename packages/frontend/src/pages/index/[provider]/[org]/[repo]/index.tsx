import { Breadcrumb, Button, Divider, Space, Tabs } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {Outlet, useParams} from 'react-router-dom';
import { useRequest } from 'ahooks';
import axios from 'axios';
import RIf from '@/components/RIf.tsx';

const ProjectDetailPage = () => {
  const params = useParams();
  console.log(params, 'params');
  const { data, loading } = useRequest(
    () => {
      return axios
        .get(`/api/repo/${btoa(params.org+'/'+params.repo)}`)
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
          },
        ]}
      />
      <Outlet context={{
        repo: data,
        commit: {
          s:'x'
        },
      }}/>
    </RIf>
  );
};

export default ProjectDetailPage;
