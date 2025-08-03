import { useState } from 'react';
import { Card, Typography, Button, Space, Tag, Input, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, GitlabOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from "../components/Layout.tsx";

const { Title, Text } = Typography;

interface Repo {
  id: string;
  pathWithNamespace: string;
  description: string;
  bu: string;
  reportTimes: number;
  lastReportTime: string;
  createdAt: string;
  updatedAt: string;
}

const Projects = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const { data: repos, loading, refresh } = useRequest(() => {
    return axios
      .get('/api/v1/repo', { params: { keyword } })
      .then((res) => res.data);
  }, {
    refreshDeps: [keyword],
    debounceWait: 300,
  });

  const handleProjectClick = (repo: Repo) => {
    // Navigate to commits page
    const parts = repo.pathWithNamespace.split('/');
    if (parts.length >= 2) {
      const provider = 'gitlab'; // Default provider
      const org = parts[0];
      const repoName = parts.slice(1).join('/');
      navigate(`/${provider}/${org}/${repoName}/commits`);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes}m ago`;
      }
      return `${diffInHours}h ago`;
    }
    return `${diffInDays}d ago`;
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Projects</Title>
          <Space>
            <Input
              placeholder="Search repositories..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />}>
              New Project
            </Button>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos?.map((repo: Repo) => (
              <Card
                key={repo.id}
                hoverable
                className="h-full cursor-pointer"
                onClick={() => handleProjectClick(repo)}
                actions={[
                  <Button type="link" key="view" onClick={(e) => {
                    e.stopPropagation();
                    handleProjectClick(repo);
                  }}>
                    View Commits
                  </Button>,
                  <Button type="link" key="settings" onClick={(e) => e.stopPropagation()}>
                    Settings
                  </Button>
                ]}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <GitlabOutlined className="text-orange-500" />
                      <Title level={4} className="mb-0 truncate">
                        {repo.pathWithNamespace}
                      </Title>
                    </div>
                    <Tag color={repo.reportTimes > 0 ? 'green' : 'default'}>
                      {repo.reportTimes > 0 ? 'active' : 'inactive'}
                    </Tag>
                  </div>
                  
                  <Text type="secondary" className="mb-4 flex-1 line-clamp-2">
                    {repo.description || 'No description available'}
                  </Text>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text>BU:</Text>
                      <Text strong>{repo.bu || 'N/A'}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Reports:</Text>
                      <Text strong>{repo.reportTimes}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Last Report:</Text>
                      <Text>
                        {repo.lastReportTime && repo.lastReportTime !== '1970-01-01T00:00:00.000Z' 
                          ? formatTimeAgo(repo.lastReportTime)
                          : 'Never'
                        }
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && (!repos || repos.length === 0) && (
          <div className="text-center py-12">
            <Text type="secondary">
              {keyword ? 'No repositories found matching your search.' : 'No repositories found.'}
            </Text>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
