import RIf from '@/components/RIf.tsx';
import { SettingOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Breadcrumb, Button, Divider, Space, Tabs } from 'antd';
import axios from 'axios';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

const ProjectDetailPage = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  console.log(params, 'params');
  const { data, loading } = useRequest(
    () => {
      return axios.get(`/api/repo/${btoa(`${params.org}/${params.repo}`)}`).then((res) => res.data);
    },
    {
      refreshDeps: [],
      onSuccess(v) {
        console.log(v);
      },
    }
  );

  return (
    <RIf condition={data}>
      <div className={'flex h-[48px] items-center justify-between px-[16px]'}>
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
        activeKey={
          location.pathname.includes('/pulls')
            ? 'pulls'
            : location.pathname.includes('/multiple-commits')
              ? 'multiple-commits'
              : 'commits'
        }
        onChange={(key) => {
          navigate(`/${params.provider}/${params.org}/${params.repo}/${key}`);
        }}
        items={[
          { key: 'commits', label: 'Commits' },
          { key: 'pulls', label: 'Pulls' },
        ]}
      />
      <Outlet
        context={{
          repo: data,
          commit: {
            s: 'x',
          },
        }}
      />
    </RIf>
  );
};

export default ProjectDetailPage;
