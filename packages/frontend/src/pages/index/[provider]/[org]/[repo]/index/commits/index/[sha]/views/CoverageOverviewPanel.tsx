import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Collapse, Progress, Space, Table, Tooltip } from 'antd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CoverageOverviewPanelProps } from '@/types';

const caseColumns = [
  {
    title: 'Report ID',
    dataIndex: 'reportID',
    key: 'reportID',
    width: 160,
    render(_: any, _c: any, index: number) {
      return (
        <a
          href='https://trip.com/'
          target={'_blank'}
          className={'flex items-center gap-1'}
          rel='noreferrer'
        >
          <img
            className={'h-[12px]'}
            src={`/providers/${_c.reportProvider}.svg`}
            alt=''
          />
          <span>{_}</span>
        </a>
      );
    },
  },
  {
    title: '名称',
    dataIndex: 'caseName',
    key: 'caseName',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (_status: any) => <Badge status='success' text='已完成' />,
  },
  {
    title: '通过率',
    key: 'passRate',
    dataIndex: 'passRate',
    width: 200,
  },
  {
    title: '用例数',
    key: 'passRate',
    width: 200,
    render: (_: any, record: any) => {
      const total = record.passedCount + record.failedCount;
      return (
        <span>
          <span className='font-medium text-green-600'>{record.passedCount}</span> / {total}
        </span>
      );
    },
  },
  {
    title: '覆盖率',
    dataIndex: 'summary',
    key: 'summary',
    render: (_: any) => {
      return _.percent;
      // return calculateCoveragePercentage(_)
    },
  },
  // calculateCoveragePercentage
];

const CoverageOverviewPanel: React.FC<CoverageOverviewPanelProps> = ({
  build,
}) => {
  const [searchParams, _setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  function getToFilePath() {
    navigate(
      `/${params.provider}/${params.org}/${params.repo}/commits/${params.sha}/-/?build_provider=${searchParams.get('build_provider')}&build_id=${searchParams.get('build_id')}`
    );
  }

  return (
    <div className=''>
      {/*<CoverageDetail open={coverageDetailOpen} />*/}
      <div className='mb-4 flex items-center justify-between rounded-lg p-4'>
        <div className='flex items-center space-x-6'>
          <div className='flex items-center space-x-2'>
            <Tooltip title='端到端测试覆盖率'>
              <span className='font-medium'>流水线:</span>
            </Tooltip>
            <a
              style={{
                textDecoration: 'underline',
              }}
            >
              #12345
            </a>
          </div>

          <div className='flex items-center space-x-2'>
            <Tooltip title='端到端测试覆盖率'>
              <span className='font-medium' onClick={() => {}}>
                E2E覆盖率:
              </span>
            </Tooltip>

            <Button
              type={'primary'}
              size={'small'}
              onClick={() => {
                getToFilePath();
              }}
            >
              查看
            </Button>
          </div>
        </div>
      </div>
      {/*{JSON.stringify(build.modeList||[])}*/}
      {build.modeList && (
        <Collapse defaultActiveKey={['manual', 'automated']}>
          <Collapse.Panel
            key='automated'
            header={
              <div className='flex w-full items-center justify-between pr-8'>
                <Space className='font-medium'>
                  <RobotOutlined />
                  自动化测试覆盖率
                </Space>
                {build.modeList.find((r: any) => r.mode === 'automated') && (
                  <Progress
                    percent={build.modeList.find((r: any) => r.mode === 'automated')!.coveragePercentage}
                    size='small'
                    status={
                      build.modeList.find((r: any) => r.mode === 'automated')!.coveragePercentage < 60
                        ? 'exception'
                        : 'active'
                    }
                    strokeColor={
                      build.modeList.find((r: any) => r.mode === 'automated')!.coveragePercentage >= 80
                        ? 'green'
                        : build.modeList.find((r: any) => r.mode === 'automated')!.coveragePercentage >=
                            60
                          ? 'blue'
                          : build.modeList.find((r: any) => r.mode === 'automated')!
                                .coveragePercentage >= 40
                            ? 'orange'
                            : 'red'
                    }
                    style={{
                      width: '80px',
                    }}
                  />
                )}
              </div>
            }
            className='border-0'
          >
            {build.modeList
              .filter((r: any) => r.mode === 'auto')
              .map((report: any) => (
                <div key={report.reportID} className='mb-4'>
                  <Table
                    columns={caseColumns}
                    dataSource={report.caseList}
                    rowKey='caseId'
                    size='small'
                    pagination={false}
                    className='border border-gray-200 '
                    style={{
                      borderBottom: 0,
                    }}
                  />
                </div>
              ))}
          </Collapse.Panel>
          <Collapse.Panel
            key='manual'
            header={
              <div className='flex w-full items-center justify-between pr-8'>
                <Space className='font-medium'>
                  <UserOutlined />
                  手工测试覆盖率
                </Space>
                {/*{JSON.stringify(build.modeList||[])}*/}
                {build.modeList?.find((r: any) => r.mode === 'manual') && (
                  <Progress
                    percent={build.modeList?.find((r: any) => r.mode === 'manual')!.coveragePercentage}
                    size='small'
                    status={
                      build.modeList?.find((r: any) => r.mode === 'manual')!.coveragePercentage < 60
                        ? 'exception'
                        : 'active'
                    }
                    strokeColor={
                      build.modeList?.find((r: any) => r.mode === 'manual')!.coveragePercentage >= 80
                        ? 'green'
                        : build.modeList?.find((r: any) => r.mode === 'manual')!.coveragePercentage >= 60
                          ? 'blue'
                          : build.modeList?.find((r: any) => r.mode === 'manual')!.coveragePercentage >=
                              40
                            ? 'orange'
                            : 'red'
                    }
                    style={{
                      width: '80px',
                    }}
                  />
                )}
              </div>
            }
            className='border-0'
          >
            {build.modeList
              ?.filter((r: any) => r.mode === 'manual')
              .map((report: any) => (
                <div key={report.reportID} className='mb-4'>
                  {/*{JSON.stringify(report.caseList||[])}*/}
                  <Table
                    columns={caseColumns}
                    dataSource={report.caseList}
                    rowKey='caseId'
                    size='small'
                    pagination={false}
                    className='border border-gray-200'
                    style={{
                      borderBottom: 0,
                    }}
                  />
                </div>
              ))}
          </Collapse.Panel>
        </Collapse>
      )}
    </div>
  );
};

export default CoverageOverviewPanel;
