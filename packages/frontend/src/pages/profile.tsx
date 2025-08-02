import { Card, Avatar, Descriptions, Button, Space } from 'antd';
import { GithubOutlined, MailOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  if (!user) {
    return null;
  }

  const handleRefresh = async () => {
    await refreshUser();
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <div className="flex items-start gap-6 mb-6">
              <Avatar
                src={user.avatar_url}
                size={120}
                alt={user.username}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  {user.name || user.username}
                </h1>
                <p className="text-gray-600 mb-4">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-800 dark:text-gray-200 mb-4">
                    {user.bio}
                  </p>
                )}
                <Space>
                  <Button
                    icon={<GithubOutlined />}
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                  >
                    GitHub
                  </Button>
                  <Button onClick={handleRefresh}>
                    刷新信息
                  </Button>
                </Space>
              </div>
            </div>

            <Descriptions title="详细信息" column={1} bordered>
              <Descriptions.Item label="用户名">
                {user.username}
              </Descriptions.Item>
              
              {user.name && (
                <Descriptions.Item label="姓名">
                  {user.name}
                </Descriptions.Item>
              )}
              
              {user.email && (
                <Descriptions.Item label="邮箱" icon={<MailOutlined />}>
                  {user.email}
                </Descriptions.Item>
              )}
              
              {user.company && (
                <Descriptions.Item label="公司">
                  {user.company}
                </Descriptions.Item>
              )}
              
              {user.location && (
                <Descriptions.Item label="位置" icon={<EnvironmentOutlined />}>
                  {user.location}
                </Descriptions.Item>
              )}
              
              {user.blog && (
                <Descriptions.Item label="博客" icon={<LinkOutlined />}>
                  <a href={user.blog} target="_blank" rel="noopener noreferrer">
                    {user.blog}
                  </a>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="GitHub ID">
                {user.github_id}
              </Descriptions.Item>
              
              <Descriptions.Item label="注册时间">
                {new Date(user.created_at).toLocaleString()}
              </Descriptions.Item>
              
              <Descriptions.Item label="最后更新">
                {new Date(user.updated_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProfilePage;