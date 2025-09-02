import {
  HeartFilled,
  HeartOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import {
  Breadcrumb,
  Button,
  Divider,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReposDocument } from '@/helpers/backend/gen/graphql.ts';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const { Text } = Typography;
const ProjectListPage = () => {
  const [keyword, setKeyword] = useState('');
  const { data, loading } = useQuery(ReposDocument, {
    variables: {
      keywords: '',
    },
  });

  const { t } = useTranslation();

  const columns: ColumnsType = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render(text, record) {
        return (
          <Space>
            <button
              className={'favor-heart'}
              style={{
                visibility: record.favored ? 'unset' : undefined,
              }}
              type='button'
              onClick={() => {}}
            >
              {record.favored ? (
                <HeartFilled style={{ color: 'red' }} />
              ) : (
                <HeartOutlined />
              )}
            </button>
            {text}
          </Space>
        );
      },
    },
    {
      title: t('projects.name'),
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
      render: (text, record) => {
        return (
          <div className={'flex gap-1'}>
            <img
              src='/providers/gitlab.svg'
              alt=''
              className={'mt-1 w-[16px] h-[16px]'}
            />

            <span style={{ width: '4px', display: 'inline-block' }}></span>
            <div className={'flex gap-1 flex-col'}>
              <span className={'max-w-[240px]'} style={{ color: 'unset' }}>
                {text}
              </span>
              <Text
                type={'secondary'}
                style={{ fontSize: '12px', width: '240px' }}
              >
                {record.description}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Bu',
      dataIndex: 'bu',
      sorter: true,
    },
    {
      title: t('projects.report_times'),
      dataIndex: 'reportTimes',
      sorter: true,
    },
    {
      title: (
        <>
          <Tooltip
            title={t('projects.max_coverage_tooltip')}
            className={'!mr-2'}
          >
            <QuestionCircleOutlined />
          </Tooltip>
          最大覆盖率
        </>
      ),
      dataIndex: 'maxCoverage',
      key: 'maxCoverage',
      sorter: true,
      render: (text) => {
        return <Space>{text}</Space>;
      },
    },
    {
      title: t('projects.latest_report_time'),
      dataIndex: 'lastReportTime',
      sorter: true,
      render(_) {
        return <span>{dayjs(_).format('MM-DD HH:mm')}</span>;
      },
    },
    {
      title: t('common.option'),
      key: 'option',
      render: (_, { id, pathWithNamespace }) => {
        return (
          <>
            <Link
              to={{
                pathname: `/gitlab/${pathWithNamespace}/commits`,
              }}
            >
              {t('common.detail')}
            </Link>
            <Divider type={'vertical'} />
            <Link
              to={{
                pathname: `/projects/${id}/settings`,
              }}
            >
              {t('common.settings')}
            </Link>
          </>
        );
      },
    },
  ];

  const { token } = theme.useToken();

  return (
    <BasicLayout>
      <div className={'h-[48px] flex items-center justify-between px-[16px]'}>
        <Breadcrumb
          items={[
            {
              title: 'Project',
            },
          ]}
        />

        <Space>
          <Button type={'primary'} size={'small'} href={'/projects/new'}>
            New Project
          </Button>
        </Space>
      </div>
      <Divider style={{ margin: '0' }} />
      <div className={'p-3'}>
        <div className={'flex justify-between'}>
          <div>
            <Select
              defaultValue={[]}
              mode='multiple'
              onChange={(v) => {
                localStorage.setItem('bu', JSON.stringify(v));
              }}
              placeholder={'Bu'}
              className={'w-[200px] !mr-2'}
              options={[]}
            />

            <Input.Search
              placeholder={t('projects.search_keywords')}
              className={'!w-[420px] mb-3'}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => {
                // TODO: 调用接口/刷新列表，当前未实现
              }}
            />
            <Space className={'ml-5'}>
              <Text type={'secondary'}>{t('common.favor.only')}: </Text>
              <Switch
                checkedChildren={<HeartFilled />}
                defaultChecked={Boolean(
                  localStorage.getItem('favorOnlyFilter'),
                )}
                onChange={(v) => {
                  if (v) {
                    localStorage.setItem('favorOnlyFilter', '1');
                  } else {
                    localStorage.removeItem('favorOnlyFilter');
                  }
                }}
              />
            </Space>
          </div>
        </div>

        <div
          className={'overflow-hidden'}
          style={{
            border: `1px solid ${token.colorBorder}`,
            boxShadow: `${token.boxShadowTertiary}`,
            borderRadius: 2,
          }}
        >
          <Table
            loading={loading}
            columns={columns}
            dataSource={data?.repos.data || []}
          />
        </div>
      </div>
    </BasicLayout>
  );
};

export default ProjectListPage;
