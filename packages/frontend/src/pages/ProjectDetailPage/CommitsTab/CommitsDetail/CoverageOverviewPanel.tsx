import { Badge, Collapse, Progress, Space, Table, Tooltip } from 'antd';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { CaseData } from './CommitsDetail';
import {calculateCoveragePercentage} from "@/helper/coverage.ts";

interface CoverageOverviewPanelProps {
  build: any;
  coverageDetailOpen: boolean;
  setCoverageDetailOpen: (open: boolean) => void;
}

const caseColumns: TableProps<CaseData>['columns'] = [
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
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status) => <Badge status="success" text="已完成" />,
  },
  {
    title: '用例数/成功率',
    key: 'successFailureRate',
    width: 200,
    render: (_, record) => {
      const total = record.successCount + record.failureCount;
      const rate = total > 0 ? (record.successCount / total) * 100 : 0;
      return (
        <span>
          <span className="text-green-600 font-medium">
            {record.successCount}
          </span>{' '}
          / {rate}%
        </span>
      );
    },
  },
  {
    title: '覆盖率',
    dataIndex: 'coverage',
    key: 'coverage',
    render: (_) => {
      return calculateCoveragePercentage(_)
    }
  },
  // calculateCoveragePercentage
];

const CoverageOverviewPanel: React.FC<CoverageOverviewPanelProps> = ({
  build,
  coverageDetailOpen,
  setCoverageDetailOpen,
}) => {
  return (
    <div className="">
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
                  setCoverageDetailOpen(true);
                }}
              >
                E2E覆盖率:
              </span>
            </Tooltip>
            <Progress
              percent={build?.coverage?.e2eCoverage}
              size="small"
              status={
                build?.coverage?.e2eCoverage < 60 ? 'exception' : 'active'
              }
              strokeColor={
                build?.coverage?.e2eCoverage >= 80
                  ? 'green'
                  : build?.coverage?.e2eCoverage >= 60
                    ? 'blue'
                    : build?.coverage?.e2eCoverage >= 40
                      ? 'orange'
                      : 'red'
              }
              style={{
                width: '80px',
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Tooltip title="单元测试覆盖率">
              <span className="font-medium">单测覆盖率:</span>
            </Tooltip>
            <Progress
              percent={build?.coverage?.unitTestCoverage}
              size="small"
              status={
                build?.coverage?.unitTestCoverage < 60 ? 'exception' : 'active'
              }
              strokeColor={
                build?.coverage?.unitTestCoverage >= 80
                  ? 'green'
                  : build?.coverage?.unitTestCoverage >= 60
                    ? 'blue'
                    : build?.coverage?.unitTestCoverage >= 40
                      ? 'orange'
                      : 'red'
              }
              style={{
                width: '80px',
              }}
            />
          </div>
        </div>
      </div>

      {build.modeList && (
        <Collapse defaultActiveKey={['manual', 'automated']}>
          <Collapse.Panel
            key="manual"
            header={
              <div className="flex items-center justify-between w-full pr-8">
                <Space className="font-medium">
                  <UserOutlined />
                  手工测试覆盖率
                </Space>
                {build.modeList?.find((r) => r.type === 'manual') && (
                  <Progress
                    percent={
                      build.modeList?.find((r) => r.type === 'manual')!
                        .coveragePercentage
                    }
                    size="small"
                    status={
                      build.modeList?.find((r) => r.type === 'manual')!
                        .coveragePercentage < 60
                        ? 'exception'
                        : 'active'
                    }
                    strokeColor={
                      build.modeList?.find((r) => r.type === 'manual')!
                        .coveragePercentage >= 80
                        ? 'green'
                        : build.modeList?.find((r) => r.type === 'manual')!
                              .coveragePercentage >= 60
                          ? 'blue'
                          : build.modeList?.find((r) => r.type === 'manual')!
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
              ?.filter((r) => r.type === 'manual')
              .map((report) => (
                <div key={report.reportID} className="mb-4">
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
          <Collapse.Panel
            key="automated"
            header={
              <div className="flex items-center justify-between w-full pr-8">
                <Space className="font-medium">
                  <RobotOutlined />
                  自动化测试覆盖率
                </Space>
                {build.modeList.find((r) => r.type === 'automated') && (
                  <Progress
                    percent={
                      build.modeList.find((r) => r.type === 'automated')!
                        .coveragePercentage
                    }
                    size="small"
                    status={
                      build.modeList.find((r) => r.type === 'automated')!
                        .coveragePercentage < 60
                        ? 'exception'
                        : 'active'
                    }
                    strokeColor={
                      build.modeList.find((r) => r.type === 'automated')!
                        .coveragePercentage >= 80
                        ? 'green'
                        : build.modeList.find((r) => r.type === 'automated')!
                              .coveragePercentage >= 60
                          ? 'blue'
                          : build.modeList.find((r) => r.type === 'automated')!
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
              .filter((r) => r.type === 'auto')
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
        </Collapse>
      )}
    </div>
  );
};

export default CoverageOverviewPanel;
