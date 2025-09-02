import { SettingOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { Breadcrumb, Divider, Drawer, Tabs } from 'antd';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import RIf from '@/components/RIf.tsx';
import { RepoDocument } from '@/helpers/backend/gen/graphql.ts';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const ProjectDetailPage = () => {
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: r } = useQuery(RepoDocument, {
    variables: {
      id: `${params.org}/${params.repo}`,
    },
  });

  const data = r?.repo;

  return (
    <BasicLayout>
      <RIf condition={Boolean(data)}>
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

          <button
            type={'button'}
            onClick={() => setIsSettingsDrawerOpen(true)}
            className={'cursor-pointer flex items-center'}
            aria-label={'项目设置'}
            title={'项目设置'}
          >
            {/*设置*/}
            <SettingOutlined />
          </button>
        </div>
        <Divider style={{ margin: '0' }} />
        <Drawer
          width={520}
          title={'项目设置'}
          open={isSettingsDrawerOpen}
          onClose={() => setIsSettingsDrawerOpen(false)}
          destroyOnClose
        >
          <div className={'space-y-[12px]'}>
            <div>
              <div className={'text-[12px] text-gray-500'}>仓库</div>
              <div className={'text-[14px] font-medium'}>
                {data?.pathWithNamespace || `${params.org}/${params.repo}`}
              </div>
            </div>
            <div>
              <div className={'text-[12px] text-gray-500'}>Provider</div>
              <div className={'text-[14px] font-medium'}>{params.provider}</div>
            </div>
          </div>
        </Drawer>
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
          }}
        />
      </RIf>
    </BasicLayout>
  );
};

export default ProjectDetailPage;
