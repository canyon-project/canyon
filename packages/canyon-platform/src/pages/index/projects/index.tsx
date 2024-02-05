import { FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Divider, Popconfirm, Select, Table, Typography } from 'antd';
import Search from 'antd/es/input/Search';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  DeleteProjectDocument,
  GetProjectsBuOptionsDocument,
  GetProjectsDocument,
  Project,
} from '../../../helpers/backend/gen/graphql.ts';

const { Title } = Typography;

const ProjectPage = () => {
  const { t } = useTranslation();
  const [deleteProject] = useMutation(DeleteProjectDocument);
  const columns: ColumnsType<Project> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('projects.table.name'),
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
    },
    {
      title: 'Bu',
      dataIndex: 'bu',
      sorter: true,
    },
    {
      title: t('Report Times'),
      dataIndex: 'reportTimes',
      sorter: true,
    },
    {
      title: 'Max coverage',
      dataIndex: 'maxCoverage',
      key: 'maxCoverage',
      sorter: true,
      render: (text) => {
        return <span>{text}%</span>;
      },
    },
    {
      title: t('Last Report Time'),
      dataIndex: 'lastReportTime',
      sorter: true,
      render(_) {
        return <span>{dayjs(_).format('YYYY-MM-DD HH:mm')}</span>;
      },
    },
    {
      title: t('projects.table.option'),
      key: 'operation',
      render: (_, { id }) => (
        <>
          <Link
            to={{
              pathname: `/projects/${id}`,
            }}
          >
            {t('projects.table.detail')}
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
            <a className={'text-red-500 hover:text-red-600'}>{t('Delete')}</a>
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
              Create a Project
            </Button>
          </Link>
        </div>
      </div>

      <div className={'p-6'}>
        <Select
          defaultValue={initBu}
          mode='multiple'
          onChange={(v) => {
            setBu(v);
            localStorage.setItem('bu', JSON.stringify(v));
          }}
          placeholder={'Bu'}
          className={'w-[200px] mr-2'}
          options={(projectsBuOptionsData?.getProjectsBuOptions || []).map(({ bu }) => ({
            label: bu,
            value: bu,
          }))}
        />
        <Search
          placeholder={'Search by project id or name'}
          className={'w-[480px] mb-3'}
          onSearch={(value) => {
            setKeyword(value);
            setCurrent(1);
          }}
        />
        <Card className={''} bodyStyle={{ padding: 0, overflow: 'hidden' }}>
          <Table
            loading={loading}
            rowKey={'id'}
            pagination={{
              total: projectsData?.getProjects?.total,
              showTotal: (total) => `Total ${total} items`,
              current,
              pageSize,
            }}
            bordered={false}
            dataSource={projectsData?.getProjects?.data || []}
            columns={columns}
            onChange={(val, _, _sorter:any) => {
              setSorter({
                field: _sorter.field,
                order: _sorter.order,
              });
              setCurrent(val.current || 1);
              setPageSize(val.pageSize || 10);
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default ProjectPage;
