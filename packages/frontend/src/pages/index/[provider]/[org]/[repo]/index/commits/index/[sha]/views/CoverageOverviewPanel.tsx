import { Badge, Button, Collapse, Progress, Space, Table, Tooltip } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
// import { CaseData } from './CommitsDetail';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';

interface CoverageOverviewPanelProps {
  build: any;
  coverageDetailOpen: boolean;
  setCoverageDetailOpen: (open: boolean) => void;
}

const caseColumns = [
  {
    title: 'Report ID',
    dataIndex: 'reportID',
    key: 'reportID',
    width: 160,
    render(_, c, index) {
      return (
        <a
          href="https://trip.com/"
          target={'_blank'}
          className={'flex items-center gap-1'}
        >
          <img
            className={'h-[12px]'}
            src={`/providers/${index % 2 === 1 ? 'mpaas.svg' : 'mpaas.svg'}`}
            alt=""
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
    render: (status) => <Badge status="success" text="已完成" />,
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
    render: (_, record) => {
      const total = record.passedCount + record.failedCount;
      const rate = record.passRate;
      return (
        <span>
          <span className="text-green-600 font-medium">
            {record.passedCount}
          </span>{' '}
          / {total}
        </span>
      );
    },
  },
  {
    title: '覆盖率',
    dataIndex: 'summary',
    key: 'summary',
    render: (_) => {
      return _.percent;
      // return calculateCoveragePercentage(_)
    },
  },
  // calculateCoveragePercentage
];

const CoverageOverviewPanel: React.FC<CoverageOverviewPanelProps> = ({
  build,
  coverageDetailOpen,
  setCoverageDetailOpen,
                                                                       commit
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  function getToFilePath() {

    navigate(`/${params.provider}/${params.org}/${params.repo}/commits/${commit.sha}/-/?build_provider=${searchParams.get('build_provider')}&build_id=${searchParams.get('build_id')}`)
  }

  return (
    <div className="">
      {/*<CoverageDetail open={coverageDetailOpen} />*/}
      <div className="flex items-center justify-between mb-4  p-4 rounded-lg">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Tooltip title="端到端测试覆盖率">
              <span className="font-medium">流水线:</span>
            </Tooltip>
            <a
              style={{
                textDecoration: 'underline',
              }}
            >
              #12345
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip title="端到端测试覆盖率">
              <span
                className="font-medium"
                onClick={() => {

                }}
              >
                E2E覆盖率:
              </span>
            </Tooltip>

            <Button
              type={'primary'}
              size={'small'}
              onClick={() => {
                getToFilePath()
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
            key="automated"
            header={
              <div className="flex items-center justify-between w-full pr-8">
                <Space className="font-medium">
                  <RobotOutlined />
                  自动化测试覆盖率
                </Space>
                {build.modeList.find((r) => r.mode === 'automated') && (
                  <Progress
                    percent={
                      build.modeList.find((r) => r.mode === 'automated')!
                        .coveragePercentage
                    }
                    size="small"
                    status={
                      build.modeList.find((r) => r.mode === 'automated')!
                        .coveragePercentage < 60
                        ? 'exception'
                        : 'active'
                    }
                    strokeColor={
                      build.modeList.find((r) => r.mode === 'automated')!
                        .coveragePercentage >= 80
                        ? 'green'
                        : build.modeList.find((r) => r.mode === 'automated')!
                              .coveragePercentage >= 60
                          ? 'blue'
                          : build.modeList.find((r) => r.mode === 'automated')!
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
            className="border-0"
          >
            {build.modeList
              .filter((r) => r.mode === 'auto')
              .map((report) => (
                <div key={report.reportID} className="mb-4">
                  <Table
                    columns={caseColumns}
                    dataSource={report.caseList}
                    rowKey="caseId"
                    size="small"
                    pagination={false}
                    className="border border-gray-200 "
                    style={{
                      borderBottom: 0,
                    }}
                  />
                </div>
              ))}
          </Collapse.Panel>
          <Collapse.Panel
            key="manual"
            header={
              <div className="flex items-center justify-between w-full pr-8">
                <Space className="font-medium">
                  <UserOutlined />
                  手工测试覆盖率
                </Space>
                {/*{JSON.stringify(build.modeList||[])}*/}
                {build.modeList?.find((r) => r.mode === 'manual') && (
                  <Progress
                    percent={
                      build.modeList?.find((r) => r.mode === 'manual')!
                        .coveragePercentage
                    }
                    size="small"
                    status={
                      build.modeList?.find((r) => r.mode === 'manual')!
                        .coveragePercentage < 60
                        ? 'exception'
                        : 'active'
                    }
                    strokeColor={
                      build.modeList?.find((r) => r.mode === 'manual')!
                        .coveragePercentage >= 80
                        ? 'green'
                        : build.modeList?.find((r) => r.mode === 'manual')!
                          .coveragePercentage >= 60
                          ? 'blue'
                          : build.modeList?.find((r) => r.mode === 'manual')!
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
            className="border-0"
          >
            {build.modeList
              ?.filter((r) => r.mode === 'manual')
              .map((report) => (
                <div key={report.reportID} className="mb-4">
                  {/*{JSON.stringify(report.caseList||[])}*/}
                  <Table
                    columns={caseColumns}
                    dataSource={report.caseList}
                    rowKey="caseId"
                    size="small"
                    pagination={false}
                    className="border border-gray-200"
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
