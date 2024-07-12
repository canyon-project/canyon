import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { Divider, Layout, Menu, theme } from 'antd';
import React from 'react';
import { Outlet } from 'react-router-dom';

// import { MeDocument } from '../helpers/backend/gen/graphql.ts';
// import {mockData} from "./mockData.ts";

const { Header, Sider, Content } = Layout;

const IndexPage: React.FC = () => {
  // const { data } = useQuery(MeDocument);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => {
    if (loc.pathname === '/') {
      console.log('首页');
      nav(`/projects`);
    }
  }, [loc.pathname]);

  return (
    <Layout>
      <Sider
        trigger={null}
        theme={'light'}
        width={260}
        style={{
          borderRight: '1px solid rgb(232, 232, 232)',
        }}
      >
        <div
          style={{ fontSize: '18px', borderBottom: '1px solid rgb(232, 232, 232)' }}
          className={'p-5'}
        >
          <img src='/logo.svg' alt='' className={'w-[24px] mr-2'} />
          <a href={'/'} style={{ color: 'unset', textDecoration: 'unset' }}>
            小飞机
          </a>
        </div>
        <Menu
          mode='inline'
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'Projects',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'Settings',
            },
          ]}
        />
        {/*<div className={'mt-[500px]'}>*/}
        {/*  {data?.me.email}*/}
        {/*</div>*/}
      </Sider>
      <Layout
        style={{
          backgroundColor: 'rgb(251, 252, 253)',
        }}
      >
        <Content
          style={{
            margin: '24px 16px',
            minHeight: 'calc(100vh - 50px)',
            // background: 'green',
            borderRadius: borderRadiusLG,
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default IndexPage;
