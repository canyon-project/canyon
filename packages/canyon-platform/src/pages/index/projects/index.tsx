import {
  FolderOutlined,
  HeartFilled,
  HeartOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CanyonCardPrimary, CanyonTextTitle } from 'canyon-ui';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  DeleteProjectDocument,
  FavorProjectDocument,
  GetProjectsBuOptionsDocument,
  GetProjectsDocument,
  Project,
} from '../../../helpers/backend/gen/graphql.ts';

const { Text } = Typography;

const tagsData = ['V2Vi', 'Q1JO', 'VHJpcC5jb20=', 'Q3RyaXA=', 'RkxJR0hU', 'Q09SUA=='].map(atob);

const colors = ['#4FA15B', '#087EA4', '#287DFA', '#FFB400', '#981d97', '#0B52D1'];
function countingStars(num: any) {
  if (num >= 75 && num < 80) {
    return '🌟';
  } else if (num >= 80 && num < 85) {
    return '🌟🌟';
  } else if (num >= 85 && num < 90) {
    return '🌟🌟🌟';
  } else if (num >= 90 && num < 95) {
    return '🌟🌟🌟🌟';
  } else if (num >= 95 && num <= 100) {
    return '🌟🌟🌟🌟🌟';
  }
}
const ProjectPage = () => {
  const { t } = useTranslation();
  const [deleteProject] = useMutation(DeleteProjectDocument);
  const [favorProject] = useMutation(FavorProjectDocument);
  const columns: ColumnsType<Project> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render(text, record) {
        return (
          <Space>
            <div
              className={'favor-heart'}
              style={{ visibility: record.favored ? 'unset' : undefined }}
              onClick={() => {
                favorProject({
                  variables: {
                    projectID: record.id,
                    favored: !record.favored,
                  },
                }).then(() => {
                  refetch().then(() => {
                    message.success('success');
                  });
                });
              }}
            >
              {record.favored ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
            </div>
            {text}
          </Space>
        );
      },
    },
    {
      title: t('projects.name'),
      dataIndex: 'pathWithNamespace',
      key: 'pathWithNamespace',
      width: '230px',
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
      title: '标签',
      dataIndex: 'tag',
      render: (text) => {
        const selectedTags = text ? text.split(',') : [];
        return (
          <div className={'flex w-[130px] flex-wrap'}>
            {selectedTags.map((tag: string) => (
              <Tag
                className={'mb-2'}
                key={tag}
                color={tagsData.indexOf(tag) > -1 ? colors[tagsData.indexOf(tag)] : '#108ee9'}
              >
                {tag}
              </Tag>
            ))}
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
        return (
          <Space>
            {text}%{countingStars(text)}
          </Space>
        );
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
  const initFavorOnly = Boolean(localStorage.getItem('favorOnlyFilter'));
  const [keyword, setKeyword] = useState('');
  const [favorOnly, setFavorOnly] = useState(initFavorOnly);
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
      favorOnly: favorOnly,
    },
    fetchPolicy: 'no-cache',
  });

  return (
    <>
      <CanyonTextTitle
        icon={<FolderOutlined />}
        title={t('menus.projects')}
        right={
          <Link to={`/projects/new`}>
            <Button type={'primary'} icon={<PlusOutlined />}>
              {t('projects.create')}
            </Button>
          </Link>
        }
      />

      <div>
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
            <Input.Search
              placeholder={t('projects.search_keywords')}
              className={'w-[480px] mb-3'}
              onSearch={(value) => {
                setKeyword(value);
                setCurrent(1);
              }}
            />
            <Space className={'ml-5'}>
              <Text type={'secondary'}>Favor Only: </Text>
              <Switch
                checkedChildren={<HeartFilled />}
                defaultChecked={Boolean(localStorage.getItem('favorOnlyFilter'))}
                onChange={(v) => {
                  if (v) {
                    localStorage.setItem('favorOnlyFilter', '1');
                  } else {
                    localStorage.removeItem('favorOnlyFilter');
                  }
                  setFavorOnly(v);
                }}
              />
            </Space>
          </div>
        </div>

        <CanyonCardPrimary>
          <Table
            showSorterTooltip={false}
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
        </CanyonCardPrimary>
      </div>
    </>
  );
};

export default ProjectPage;
