import { Breadcrumb, Button, Divider, Space, Tabs } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import RIf from '@/components/RIf.tsx'
import { useQuery } from '@apollo/client'
import { RepoDocument } from '@/helpers/backend/gen/graphql.ts'
import BasicLayout from '@/layouts/BasicLayout.tsx'

const ProjectDetailPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  console.log(params, 'params')
  const { data: r, loading } = useQuery(RepoDocument, {
    variables: {
      id: `${params.org}/${params.repo}`,
    },
  })

  const data = r?.repo

  return (
    <BasicLayout>
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
          activeKey={
            location.pathname.includes('/pulls')
              ? 'pulls'
              : location.pathname.includes('/multiple-commits')
                ? 'multiple-commits'
                : 'commits'
          }
          onChange={(key) => {
            navigate(`/${params.provider}/${params.org}/${params.repo}/${key}`)
          }}
          items={[{ key: 'commits', label: 'Commits' }]}
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
    </BasicLayout>
  )
}

export default ProjectDetailPage
