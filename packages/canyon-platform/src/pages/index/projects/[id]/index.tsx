import { DownOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { Divider, Dropdown, Input, Progress, Spin, Table, theme } from 'antd';
import { ColumnsType } from 'antd/es/table';
import ReactECharts from 'echarts-for-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import ProjectRecordDetailDrawer from '../../../../components/app/ProjectRecordDetailDrawer.tsx';
import {
  GetProjectByIdDocument,
  GetProjectChartDataDocument,
  GetProjectCompartmentDataDocument,
  GetProjectRecordsDocument,
  GetProjectsDocument,
  Project,
  ProjectRecordsModel,
} from '../../../../helpers/backend/gen/graphql.ts';
import dayjs from "dayjs";
// const dataSource = [];
const items = [
  { key: '1', label: 'Action 1' },
  { key: '2', label: 'Action 2' },
];

const { useToken } = theme;

const ProjectOverviewPage = () => {
  const { token } = useToken();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [keyword, setKeyword] = useState('');
  // const [bu, setBu] = useState<string[]>(initBu);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [sha, setSha] = useState('');
  const onClose = () => {
    setOpen(false);
  };

  const pam = useParams();

  const {
    data: projectsData,
    loading,
    refetch,
  } = useQuery(GetProjectRecordsDocument, {
    variables: {
      projectID: pam.id as string,
      current: current,
      pageSize: pageSize,
      keyword: keyword,
    },
    fetchPolicy: 'no-cache',
  });

  const {
    data: projectByIdData,
    // loading,
    // refetch,
  } = useQuery(GetProjectByIdDocument, {
    variables: {
      projectID: pam.id as string,
      // current: 1,
      // pageSize: 10,
      // keyword: '',
    },
    fetchPolicy: 'no-cache',
  });

  const { data: projectChartData, loading: projectChartDataLoading } = useQuery(
    GetProjectChartDataDocument,
    {
      variables: {
        projectID: pam.id as string,
        // current: 1,
        // pageSize: 10,
        // keyword: '',
      },
      fetchPolicy: 'no-cache',
    },
  );

  const { data: projectCompartmentDataData, loading: projectCompartmentDataLoading } = useQuery(
    GetProjectCompartmentDataDocument,
    {
      variables: {
        projectID: pam.id as string,
        // current: 1,
        // pageSize: 10,
        // keyword: '',
      },
      fetchPolicy: 'no-cache',
    },
  );

  const columns: ColumnsType<ProjectRecordsModel> = [
    {
      title: 'Sha',
      dataIndex: 'sha',
      render(_, { webUrl }): JSX.Element {
        return (
          <a href={webUrl} target={'_blank'} rel='noreferrer'>
            {_?.slice(0, 7)}
          </a>
        );
      },
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      width: '160px',
      ellipsis: true,
    },
    {
      title: 'Compare Target',
      dataIndex: 'compareTarget',
      width: '160px',
      render(_, { compareUrl }): JSX.Element {
        return (
          <a href={compareUrl} target={'_blank'} rel='noreferrer'>
            {_.length === 40 ? _.slice(0, 7) : _}
          </a>
        );
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      width: '160px',
      ellipsis: true,
    },
    {
      title: 'Statements',
      dataIndex: 'statements',
      render(_, { sha }) {
        return (
          <Link
            to={{
              pathname: `/projects/${pam.id}/commits/${sha}`,
            }}
            onClick={() => {
              // nav(`/project/${pam.id}/commits/${_}`);
            }}
          >
            {_}%
          </Link>
        );
      },
    },
    {
      title: 'New Lines',
      dataIndex: 'newlines',
      render(_, { sha }) {
        return (
          <Link
            to={{
              pathname: `/projects/${pam.id}/commits/${sha}`,
              search: '?mode=codechange',
              // query: {},
            }}
          >
            {_}%
          </Link>
        );
      },
    },
    {
      title: 'Times',
      dataIndex: 'times',
    },
    {
      title: 'Last Report',
      dataIndex: 'lastReportTime',
      width: '120px',
      render(_) {
        return <span>{dayjs(_).format('MM-DD HH:mm')}</span>;
      },
    },
    // {
    //   title: 'Agg Process',
    //   dataIndex: 'times',
    //   render(_: any): JSX.Element {
    //     return <Progress percent={50} size='small' status='active' />;
    //   },
    // },
    {
      title: 'Option',
      render(_): JSX.Element {
        return (
          <div className={'w-[100px]'}>
            <a
              onClick={() => {
                setOpen(true);
                setSha(_.sha);
              }}
            >
              Logs
            </a>
          </div>
        );
      },
    },
  ];

  const option = {
    grid: {
      top: '30px',
      left: '30px',
      right: '10px',
      bottom: '20px',
    },
    tooltip: {
      trigger: 'axis',
    },
    // legend: {
    //   x: 'right',
    //   data: ['Overall', 'New Lines'],
    // },
    legend: {
      x: 'right',
      data: ['Statements', 'New Lines'],
    },
    xAxis: {
      type: 'category',
      data: projectChartData?.getProjectChartData.map(({ sha }) => sha.slice(0, 7)) || [],
    },
    yAxis: {
      type: 'value',
    },
    series: ['Statements', 'New Lines'].map((_, index) => ({
      name: _,
      data:
        projectChartData?.getProjectChartData.map(({ statements, newlines }) =>
          index === 0 ? statements : newlines,
        ) || [],
      type: 'line',
    })),
  };

  return (
    <div className={'px-6 pt-5 pb-5'}>
      <h1 className={'mb-10'}>{projectByIdData?.getProjectByID.pathWithNamespace}</h1>

      <p className={'text-[#6b6d85]'}>{t('projects.overview')}</p>

      <div className={'flex mb-10'}>
        <Spin spinning={projectCompartmentDataLoading}>
          <div
            className={`[list-style:none] grid grid-cols-[repeat(2,_215px)] grid-rows-[repeat(2,_1fr)] gap-[16px] h-full mr-[16px]`}
          >
            {(projectCompartmentDataData?.getProjectCompartmentData || []).map((item, index) => {
              return (
                <div
                  // style={{ border: '1px solid #dfe3e6' }}
                  className={'bg-white p-[20px] h-[150px] flex justify-between flex-col'}
                  style={{
                    border: `1px solid ${token.colorBorder}`,
                    background: 'white',
                    borderRadius: `${token.borderRadius}px`,
                  }}
                  key={index}
                >
                  <div className={'text-[#6b6d85]'}>{item.label}</div>
                  <div className={'text-xl'}>{item.value}</div>
                </div>
              );
            })}
          </div>
        </Spin>

        <div style={{ flex: 1 }}>
          <Spin spinning={projectChartDataLoading}>
            <div
              className={'bg-white p-6'}
              style={{
                border: `1px solid ${token.colorBorder}`,
                background: 'white',
                borderRadius: `${token.borderRadius}px`,
              }}
            >
              <h3>Trends in coverage</h3>
              <ReactECharts
                theme={{
                  color: ['#287DFA', '#FFB400'],
                }}
                style={{ height: '240px' }}
                option={option}
              />
            </div>
          </Spin>
        </div>
      </div>

      <p className={'text-[#6b6d85]'}>{t('projects.records')}</p>
      <Input.Search
        placeholder={'Enter the "Commit Sha" or "Branch" or "Compare Target" keyword for search'}
        onSearch={(value) => {
          // setSearchValue(value);
          setKeyword(value);
          setCurrent(1);
        }}
        style={{ width: '700px', marginBottom: '16px' }}
      />
      {/*div*/}
      <Table
        loading={loading}
        style={{
          border: `1px solid ${token.colorBorder}`,
          background: 'white',
          borderRadius: `${token.borderRadius}px`,
        }}
        bordered={false}
        rowKey={'sha'}
        columns={columns}
        pagination={{
          showTotal: (total) => `Total ${total} items`,
          total: projectsData?.getProjectRecords?.total,
          current,
          pageSize,
          // current: projectsData?.getProjects?.current,
          // pageSize: projectsData?.getProjects?.pageSize,
        }}
        dataSource={projectsData?.getProjectRecords?.data || []}
        onChange={(val) => {
          setCurrent(val.current || 1);
          setPageSize(val.pageSize || 10);
          // setKeyword(keyword);
        }}
      />

      {/*默太狂就共用一个*/}
      <ProjectRecordDetailDrawer open={open} onClose={onClose} sha={sha} />
    </div>
  );
};

export default ProjectOverviewPage;
