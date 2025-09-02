import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Select,
  Space,
  Typography,
} from 'antd';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const { Text } = Typography;

interface CheckedProject {
  id?: string | number;
  path_with_namespace?: string;
  pathWithNamespace?: string;
  description?: string | null;
}

const NewProjectPage = () => {
  const { t } = useTranslation();
  const [provider, setProvider] = useState<string>('gitlab');
  const [repoPath, setRepoPath] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [project, setProject] = useState<CheckedProject | null>(null);

  const onCheck = async () => {
    if (!repoPath) {
      message.warning('请输入仓库路径，例如 namespace/repo-name');
      return;
    }
    setChecking(true);
    setProject(null);
    try {
      // 兼容带斜杠路径，作为 path 参数需进行 URL 编码
      const encoded = encodeURIComponent(repoPath);
      const { data } = await axios.get(`/api/code/projects/${encoded}`, {
        params: { provider },
      });
      setProject(data?.data || null);
      if (!data?.data) message.warning('未获取到项目信息');
    } catch (e) {
      if (axios.isAxiosError(e)) {
        message.error(e.response?.data?.message || '检查失败');
      } else {
        message.error('检查失败');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <BasicLayout>
      <div className={'flex h-[48px] items-center justify-between px-[4px]'}>
        <Breadcrumb
          items={[
            { title: <Link to={'/projects'}>Project</Link> },
            { title: 'Create' },
          ]}
        />
        <Space>
          <Link to={'/projects'}>
            <Button size={'small'}>{t('common.back') || '返回'}</Button>
          </Link>
        </Space>
      </div>
      <Divider style={{ margin: '8px 0' }} />

      <Card title={'创建项目'} bordered={false}>
        <Descriptions column={1} size={'small'} title={'1. 从源代码创建项目'} />
        <Form layout='vertical' style={{ maxWidth: 720 }}>
          <Form.Item label={'服务提供商'} required>
            <Select
              value={provider}
              onChange={setProvider}
              placeholder={'请选择提供商'}
              options={[
                { label: 'GitLab', value: 'gitlab' },
                { label: 'GitHub', value: 'github' },
                { label: 'Gitea', value: 'gitea' },
              ]}
              style={{ width: 360 }}
            />
          </Form.Item>

          <Form.Item label={'仓库'} required>
            <Input
              placeholder={'namespace/repo-name 或 数字ID'}
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              style={{ width: 480 }}
            />
          </Form.Item>

          {/* 标识串（slug）按需求移除，不再展示 */}

          <Form.Item>
            <Space>
              <Button type='primary' loading={checking} onClick={onCheck}>
                检 查
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        <Descriptions column={1} size={'small'} title={'2. 检查你的项目'} />
        <Card size={'small'} style={{ maxWidth: 720 }}>
          {project ? (
            <Descriptions column={1} size={'small'}>
              <Descriptions.Item label='projectID'>
                {project.id ?? <Text type='secondary'>-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label='pathWithNamespace'>
                {project.path_with_namespace ?? project.pathWithNamespace ?? (
                  <Text type='secondary'>-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label='description'>
                {project.description || <Text type='secondary'>-</Text>}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text type='secondary'>点击“检查”以从代码托管平台获取项目信息</Text>
          )}
        </Card>

        <Space style={{ marginTop: 16 }}>
          <Button type='primary' disabled>
            创 建
          </Button>
          <Text type='secondary'>
            后端未提供创建接口，当前仅支持校验与查看。
          </Text>
        </Space>
      </Card>
    </BasicLayout>
  );
};

export default NewProjectPage;
