import { Breadcrumb, Button, Divider, message, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import RIf from '@/components/RIf.tsx';
import BasicLayout from '@/layouts/BasicLayout.tsx';

type Repo = {
  id: string;
  pathWithNamespace: string;
  description: string;
  bu: string;
  tags: string;
  members: string;
  config: string;
  createdAt: string;
  updatedAt: string;
};

const ProjectDetailPage = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepo = async () => {
      setLoading(true);
      try {
        // 使用 pathWithNamespace 格式的 ID 查询
        const repoId = `${params.org}/${params.repo}`;
        const resp = await fetch(`/api/repos/${encodeURIComponent(repoId)}`, {
          credentials: 'include',
        });
        if (resp.ok) {
          const data = await resp.json();
          setRepo(data);
        } else if (resp.status === 404) {
          message.error('仓库不存在');
        } else {
          message.error('获取仓库信息失败');
        }
      } catch (error) {
        message.error('获取仓库信息失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (params.org && params.repo) {
      fetchRepo();
    }
  }, [params.org, params.repo]);

  return (
    <BasicLayout>
      <RIf condition={!loading && repo !== null}>
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
            repo: repo,
          }}
        />
      </RIf>
    </BasicLayout>
  );
};

export default ProjectDetailPage;
