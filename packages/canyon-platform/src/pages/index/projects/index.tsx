import { FolderOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Divider, Popconfirm, Select, Table, theme, Tooltip, Typography } from 'antd';
import Search from 'antd/es/input/Search';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// import ProjectNoData from '../../../components/app/project/nodata.tsx';
import {
  DeleteProjectDocument,
  GetProjectsBuOptionsDocument,
  GetProjectsDocument,
  Project,
} from '../../../helpers/backend/gen/graphql.ts';

const { Title, Text } = Typography;

const { useToken } = theme;
const ProjectPage = () => {
  const { token } = useToken();
  const { t } = useTranslation();
  const [deleteProject] = useMutation(DeleteProjectDocument);
  const columns: ColumnsType<Project> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('projects.name'),
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
      render: (text, record) => {
        return (
          <div className={'flex flex-col'}>
            {text}
            <Text type={'secondary'} style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
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
          <Tooltip title={t('projects.max_coverage_tooltip')} className={'mr-2'}>
            <QuestionCircleOutlined />
          </Tooltip>
          {t('projects.max_coverage')}
        </>
      ),
      dataIndex: 'maxCoverage',
      key: 'maxCoverage',
      sorter: true,
      render: (text) => {
        return <span>{text}%</span>;
      },
    },
    {
      title: t('projects.latest_report_time'),
      dataIndex: 'lastReportTime',
      sorter: true,
      render(_) {
        return <span>{dayjs(_).format('YYYY-MM-DD HH:mm')}</span>;
      },
    },
    {
      title: t('common.option'),
      key: 'option',
      render: (_, { id }) => (
        <>
          <Link
            to={{
              pathname: `/projects/${id}`,
            }}
          >
            {t('common.detail')}
          </Link>
          <Divider type={'vertical'} />
          <Link
            to={{
              pathname: `/projects/${id}/configure`,
            }}
          >
            {t('common.configure')}
          </Link>
          <Divider type={'vertical'} />
          <Popconfirm
            title='Delete the project'
            description='Are you sure to delete this project?'
            onConfirm={() => {
              deleteProject({
                variables: {
                  projectID: id,
                },
              }).then(() => {
                refetch();
              });
            }}
            onCancel={() => {
              console.log('cancel');
            }}
            okText='Yes'
            cancelText='No'
          >
            <a className={'text-red-500 hover:text-red-600'}>{t('common.delete')}</a>
          </Popconfirm>
        </>
      ),
    },
  ];
  const initBu = (() => {
    try {
      if (JSON.parse(localStorage.getItem('bu') || '[]') instanceof Array) {
        return JSON.parse(localStorage.getItem('bu') || '[]');
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  })();
  const [keyword, setKeyword] = useState('');
  const [bu, setBu] = useState<string[]>(initBu);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorter, setSorter] = useState<any>({});

  const { data: projectsBuOptionsData } = useQuery(GetProjectsBuOptionsDocument, {
    fetchPolicy: 'no-cache',
  });

  const {
    data: projectsData,
    loading,
    refetch,
  } = useQuery(GetProjectsDocument, {
    variables: {
      current: current,
      pageSize: pageSize,
      keyword: keyword,
      bu: bu,
      field: sorter.field || '',
      order: sorter.order || '',
    },
    fetchPolicy: 'no-cache',
  });

  return (
    <div>
      <div className={'flex justify-between items-center px-6 pb-2 pt-0'}>
        <div>
          <Title level={2} className={'flex items-center gap-3'}>
            <FolderOutlined className={'text-[#687076] text-[32px]'} />
            <span>{t('menus.projects')}</span>
          </Title>
        </div>
        <div>
          <Link to={`/projects/new`}>
            <Button type={'primary'} icon={<PlusOutlined />}>
              {t('projects.create')}
            </Button>
          </Link>
        </div>
      </div>

      <div className={'p-6'}>
        <div className={'flex justify-between'}>
          <div>
            <Select
              defaultValue={initBu}
              mode='multiple'
              onChange={(v) => {
                setBu(v);
                localStorage.setItem('bu', JSON.stringify(v));
              }}
              placeholder={'Bu'}
              className={'w-[200px] mr-2'}
              options={(projectsBuOptionsData?.getProjectsBuOptions || []).map(({ bu, count }) => ({
                label: bu + ` ${count}`,
                value: bu,
              }))}
            />
            <Search
              placeholder={t('projects.search_keywords')}
              className={'w-[480px] mb-3'}
              onSearch={(value) => {
                setKeyword(value);
                setCurrent(1);
              }}
            />
          </div>
          {/*<ProjectNoData />*/}
        </div>

        <div>
          <Table
            showSorterTooltip={false}
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: `${token.borderRadius}px`,
            }}
            loading={loading}
            rowKey={'id'}
            pagination={{
              total: projectsData?.getProjects?.total,
              showTotal: (total) => t('common.total_items', { total }),
              current,
              pageSize,
            }}
            bordered={false}
            dataSource={projectsData?.getProjects?.data || []}
            // @ts-ignore
            columns={columns}
            onChange={(val, _, _sorter: any) => {
              setSorter({
                field: _sorter.field,
                order: _sorter.order,
              });
              setCurrent(val.current || 1);
              setPageSize(val.pageSize || 10);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
