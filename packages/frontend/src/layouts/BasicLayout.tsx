import { ProConfigProvider, ProLayout } from '@ant-design/pro-components'
import { HomeOutlined, ProfileOutlined } from '@ant-design/icons'
import { App as AntApp, ConfigProvider } from 'antd'
import { type FC, type ReactNode, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const BasicLayout: FC<{
  children?: ReactNode
}> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const route = useMemo(() => {
    const routes = [
      {
        path: '/projects',
        name: '项目',
        icon: <HomeOutlined />,
      },
      {
        path: '/settings',
        name: '设置',
        icon: <ProfileOutlined />,
      },
      {
        path: '/playground',
        name: 'Playground',
        icon: <ProfileOutlined />,
      },
    ]
    return {
      path: '/',
      routes,
    }
  }, [])

  return (
    <ConfigProvider>
      <ProConfigProvider>
        <AntApp>
          <ProLayout
            title='Canyon'
            logo='/logo.svg'
            layout='side'
            fixSiderbar
            fixedHeader
            collapsed={collapsed}
            onCollapse={setCollapsed}
            route={route}
            location={{ pathname: location.pathname }}
            style={{ minHeight: '100vh' }}
            token={{}}
            menuItemRender={(item, dom) => {
              if (!item.path) return dom
              return <Link to={item.path}>{dom}</Link>
            }}
          >
            <div style={{ padding: 0 }}>{children}</div>
          </ProLayout>
        </AntApp>
      </ProConfigProvider>
    </ConfigProvider>
  )
}

export default BasicLayout
