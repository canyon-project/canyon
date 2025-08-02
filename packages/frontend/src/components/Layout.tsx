import { ReactNode } from 'react';
import { Layout as AntLayout, Button, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <AntLayout className="min-h-screen">
      <Header className="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
            Canyon
          </Link>
        </div>
        
        <div className="flex items-center">
          {isAuthenticated && user ? (
            <UserAvatar user={user} />
          ) : (
            <Space>
              <Button type="primary" onClick={() => navigate('/login')}>
                登录
              </Button>
            </Space>
          )}
        </div>
      </Header>
      
      <Content className="flex-1">
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;