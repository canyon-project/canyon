import { useQuery } from '@apollo/client';
import { Breadcrumb, Button, Divider, Tabs } from 'antd';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import RIf from '@/components/RIf.tsx';
import { RepoDocument } from '@/helpers/backend/gen/graphql.ts';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const ProjectDetailPage = () => {
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
                href: `/${params.provider}/${params.org}/${params.repo}/commits`,
              },
            ]}
          />

          <Button
            type={'primary'}
            onClick={() =>
              navigate(
                `/${params.provider}/${params.org}/${params.repo}/settings`,
              )
            }
          >
            设置
          </Button>
        </div>
        <Divider style={{ margin: '0' }} />
        {!location.pathname.includes('/settings') && (
          <Tabs
            activeKey={
              location.pathname.includes('/pulls')
                ? 'pulls'
                : location.pathname.includes('/multiple-commits')
                  ? 'multiple-commits'
                  : 'commits'
            }
            onChange={(key) => {
              navigate(
                `/${params.provider}/${params.org}/${params.repo}/${key}`,
              );
            }}
            items={[
              { key: 'commits', label: 'Commits' },
              { key: 'pulls', label: 'Pulls' },
            ]}
          />
        )}
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
