import { CheckOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Select,
  Steps,
  Typography,
} from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const { Title, Text } = Typography;

type RepoInfo = {
  id: string;
  pathWithNamespace: string;
  description: string;
  bu: string;
  tags: string;
  members: string;
  config: string;
  createdAt?: string;
  updatedAt?: string;
};

const NewProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [repoExists, setRepoExists] = useState(false);

  // 检查仓库
  const handleCheck = async () => {
    const values = form.getFieldsValue();
    const { provider, repoId } = values;

    if (!provider) {
      message.error(t('new.provider.required'));
      return;
    }

    if (!repoId || !repoId.trim()) {
      message.error(t('new.repoId.required'));
      return;
    }

    setChecking(true);
    try {
      // 先检查本地数据库是否有该仓库
      const localResp = await fetch(
        `/api/repos/${encodeURIComponent(repoId)}`,
        {
          credentials: 'include',
        },
      );

      if (localResp.ok) {
        // 本地数据库已有该仓库
        const data = await localResp.json();
        setRepoInfo(data);
        setRepoExists(true);
        message.success(t('new.check.success'));
        setCurrentStep(1);
        return;
      }

      // 本地数据库没有，调用 GitLab API 获取项目信息
      if (provider === 'gitlab') {
        const gitlabResp = await fetch(
          `/api/code/project?path=${encodeURIComponent(repoId)}&provider=gitlab`,
          {
            credentials: 'include',
          },
        );

        if (gitlabResp.ok) {
          const gitlabData = await gitlabResp.json();
          // GitLab API 返回的数据包含 id (数字ID) 和 path_with_namespace
          const gitlabId = String(gitlabData.id); // 使用 GitLab 返回的数字 ID
          const pathWithNamespace = gitlabData.path_with_namespace || repoId;

          // 生成默认配置
          const defaultBranch = gitlabData.default_branch || 'main';
          const defaultConfig = JSON.stringify(
            {
              defaultBranch: defaultBranch,
              include: ['**/*'],
              exclude: ['node_modules/**', 'dist/**', 'build/**'],
              extensions: ['ts', 'tsx', 'js', 'jsx'],
            },
            null,
            2,
          );

          setRepoInfo({
            id: gitlabId, // 使用 GitLab API 返回的实际数字 ID
            pathWithNamespace: pathWithNamespace,
            description: gitlabData.description || '',
            bu: '',
            tags: '[]',
            members: '[]',
            config: defaultConfig,
          });
          setRepoExists(false);
          message.info(t('new.check.not.found'));
          setCurrentStep(1);
        } else {
          message.error(t('new.check.failed'));
        }
      } else {
        // GitHub 或其他 provider，使用原逻辑
        const pathWithNamespace = repoId.includes('/') ? repoId : repoId;

        const defaultConfig = JSON.stringify(
          {
            defaultBranch: 'main',
            include: ['**/*'],
            exclude: ['node_modules/**', 'dist/**', 'build/**'],
            extensions: ['ts', 'tsx', 'js', 'jsx'],
          },
          null,
          2,
        );

        setRepoInfo({
          id: repoId,
          pathWithNamespace: pathWithNamespace,
          description: '',
          bu: '',
          tags: '[]',
          members: '[]',
          config: defaultConfig,
        });
        setRepoExists(false);
        message.info(t('new.check.not.found'));
        setCurrentStep(1);
      }
    } catch (error) {
      console.error(error);
      message.error(t('new.check.failed'));
    } finally {
      setChecking(false);
    }
  };

  // 创建仓库
  const handleCreate = async () => {
    if (!repoInfo) {
      message.error(t('new.create.no.repo.info'));
      return;
    }

    const values = form.getFieldsValue();
    const { provider, repoId, description, bu } = values;

    setCreating(true);
    try {
      // 确保 repoInfo 有正确的 id 和 pathWithNamespace
      // 直接使用 GitLab ID 作为仓库 ID
      const finalRepoInfo: RepoInfo = {
        ...repoInfo,
        id: repoInfo.id || repoId, // 直接使用 GitLab ID
        pathWithNamespace: repoInfo.pathWithNamespace || repoId,
        description: description || repoInfo.description || '',
        bu: bu || repoInfo.bu || '',
      };

      const resp = await fetch('/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: finalRepoInfo.id,
          pathWithNamespace: finalRepoInfo.pathWithNamespace,
          description: finalRepoInfo.description,
          bu: finalRepoInfo.bu,
          tags: finalRepoInfo.tags || '[]',
          members: finalRepoInfo.members || '[]',
          config: finalRepoInfo.config,
        }),
      });

      if (resp.ok) {
        await resp.json();
        message.success(t('new.create.success'));
        // 跳转到项目详情页
        const pathParts = finalRepoInfo.pathWithNamespace.split('/');
        if (pathParts.length >= 2) {
          navigate(`/${provider}/${pathParts[0]}/${pathParts[1]}/analysis`);
        } else {
          navigate('/projects');
        }
      } else {
        const errorData = await resp.json();
        message.error(errorData.message || t('new.create.failed'));
      }
    } catch (error) {
      console.error(error);
      message.error(t('new.create.failed'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <BasicLayout>
      <div className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <Title
            level={2}
            className='!mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100'
          >
            {t('new.step1')}
          </Title>
          <Text className='text-base text-gray-600 dark:text-gray-400'>
            {t('new.step2')}
          </Text>
        </div>

        {/* Main Card */}
        <Card className='shadow-lg border-0 rounded-xl bg-white dark:bg-gray-800'>
          {/* Steps */}
          <div className='mb-10 px-2'>
            <Steps
              current={currentStep}
              items={[
                {
                  title: t('new.step.select'),
                  description: t('new.step.select.desc'),
                },
                {
                  title: t('new.step.review'),
                  description: t('new.step.review.desc'),
                },
              ]}
              className='[&_.ant-steps-item-title]:text-gray-700 [&_.ant-steps-item-title]:dark:text-gray-300 [&_.ant-steps-item-description]:text-gray-500 [&_.ant-steps-item-description]:dark:text-gray-400'
            />
          </div>

          {/* Step 1: Select Repository */}
          {currentStep === 0 && (
            <div className='px-2'>
              <Form form={form} layout='vertical' className='max-w-2xl'>
                <div className='space-y-6'>
                  <Form.Item
                    name='provider'
                    label={
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {t('new.provider')}
                      </span>
                    }
                    rules={[
                      { required: true, message: t('new.provider.required') },
                    ]}
                    className='mb-0'
                  >
                    <Select
                      placeholder={t('new.provider.placeholder')}
                      size='large'
                      className='w-full'
                    >
                      {/*<Select.Option value='github'>*/}
                      {/*  <div className='flex items-center gap-2'>*/}
                      {/*    <span className='text-lg'>🐙</span>*/}
                      {/*    <span>GitHub</span>*/}
                      {/*  </div>*/}
                      {/*</Select.Option>*/}
                      <Select.Option value='gitlab'>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg'>🦊</span>
                          <span>GitLab</span>
                        </div>
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name='repoId'
                    label={
                      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {t('new.repository')}
                      </span>
                    }
                    rules={[
                      { required: true, message: t('new.repoId.required') },
                    ]}
                    extra={
                      <span className='text-xs text-gray-500 dark:text-gray-400 mt-1 block'>
                        {t('new.repoId.extra')}
                      </span>
                    }
                    className='mb-0'
                  >
                    <Input
                      placeholder={t('new.repoId.placeholder')}
                      onPressEnter={handleCheck}
                      size='large'
                      className='w-full'
                    />
                  </Form.Item>

                  <Form.Item className='mb-0 pt-2'>
                    <Button
                      type='primary'
                      icon={<SearchOutlined />}
                      onClick={handleCheck}
                      loading={checking}
                      size='large'
                      className='w-full sm:w-auto min-w-[140px] h-11 font-medium shadow-md hover:shadow-lg transition-shadow duration-200'
                    >
                      {t('new.check')}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          )}

          {/* Step 2: Review and Create */}
          {currentStep === 1 && repoInfo && (
            <div className='px-2'>
              {/* Status Alert */}
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  repoExists
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>{repoExists ? '✅' : '⚠️'}</span>
                  <Text
                    className={`text-sm font-medium ${
                      repoExists
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {repoExists
                      ? t('new.repo.exists')
                      : t('new.repo.not.exists')}
                  </Text>
                </div>
              </div>

              {/* Repository Info */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                  {t('new.repo.info')}
                </h3>
                <div className='bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3'>
                  <div className='flex items-start gap-4'>
                    <span className='text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]'>
                      {t('new.provider')}:
                    </span>
                    <span className='text-sm text-gray-900 dark:text-gray-100 font-mono'>
                      {form.getFieldValue('provider')}
                    </span>
                  </div>
                  <div className='flex items-start gap-4'>
                    <span className='text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]'>
                      {t('new.repository')}:
                    </span>
                    <span className='text-sm text-gray-900 dark:text-gray-100 font-mono break-all'>
                      {repoInfo.pathWithNamespace}
                    </span>
                  </div>
                  <div className='flex items-start gap-4'>
                    <span className='text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]'>
                      {t('projects.config.project.id')}:
                    </span>
                    <span className='text-sm text-gray-900 dark:text-gray-100 font-mono break-all'>
                      {repoInfo.id}
                    </span>
                  </div>
                  {repoExists && (
                    <>
                      <div className='flex items-start gap-4'>
                        <span className='text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]'>
                          {t('projects.config.project.desc')}:
                        </span>
                        <span className='text-sm text-gray-900 dark:text-gray-100 flex-1'>
                          {repoInfo.description || '-'}
                        </span>
                      </div>
                      <div className='flex items-start gap-4'>
                        <span className='text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px]'>
                          {t('common.bu')}:
                        </span>
                        <span className='text-sm text-gray-900 dark:text-gray-100'>
                          {repoInfo.bu || '-'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Form Fields for New Repo */}
              {!repoExists && (
                <div className='mb-6'>
                  <Form form={form} layout='vertical' className='space-y-4'>
                    <Form.Item
                      name='description'
                      label={
                        <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          {t('projects.config.project.desc')}
                        </span>
                      }
                      className='mb-0'
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder={t('new.description.placeholder')}
                        className='resize-none'
                      />
                    </Form.Item>

                    <Form.Item
                      name='bu'
                      label={
                        <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                          {t('common.bu')}
                        </span>
                      }
                      className='mb-0'
                    >
                      <Input placeholder={t('new.bu.placeholder')} />
                    </Form.Item>
                  </Form>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <Button
                  onClick={() => setCurrentStep(0)}
                  size='large'
                  className='px-6 h-11 font-medium'
                >
                  {t('new.back')}
                </Button>
                <Button
                  type='primary'
                  icon={<CheckOutlined />}
                  onClick={handleCreate}
                  loading={creating}
                  size='large'
                  className='px-6 h-11 font-medium shadow-md hover:shadow-lg transition-shadow duration-200'
                >
                  {t('new.create')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </BasicLayout>
  );
};

export default NewProject;
