'use client';

import type React from 'react';
import { useState, useMemo } from 'react';
import {
  Table,
  Badge,
  Tabs,
  Empty,
  Tooltip,
  Progress,
  Tag,
  Collapse,
  Input,
  Radio,
  Space,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  RedoOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { TabsProps, TableProps } from 'antd';
import CoverageDetail from '@/components/CoverageDetail.tsx';

// 更新数据类型定义
interface CaseData {
  caseId: string;
  name: string;
  status: 'success' | 'failure' | 'pending';
  successCount: number;
  failureCount: number;
}

interface CoverageReport {
  reportId: string;
  type: 'manual' | 'automated';
  coveragePercentage: number;
  cases: CaseData[];
}

// 添加新的覆盖率类型
interface CoverageMetrics {
  e2eCoverage: number;
  unitTestCoverage: number;
}

// 添加进度统计类型
interface PipelineProgress {
  totalCases: number;
  successCases: number;
  failedCases: number;
  pendingCases: number;
}

// 更新流水线数据接口
interface AggregationProgress {
  total: number;
  current: number;
  status: 'aggregating' | 'completed' | 'failed';
}

// 更新 PipelineData 接口，添加 commit 相关信息
interface PipelineData {
  id: string;
  name: string;
  pipelineId: string;
  commitId: string;
  commitMessage: string;
  hasReported: boolean;
  lastUpdated: string;
  progress: PipelineProgress;
  coverage: CoverageMetrics;
  reports?: CoverageReport[];
  aggregationProgress: AggregationProgress;
}

// 更新模拟数据，添加 commit 信息
const mockPipelines: PipelineData[] = [
  {
    id: 'pipeline-001',
    name: '主干分支流水线',
    pipelineId: '#12345',
    commitId: 'a1b2c3d',
    commitMessage: 'feat: 添加用户认证功能',
    hasReported: true,
    lastUpdated: '2024-02-28 15:30:45',
    progress: {
      totalCases: 250,
      successCases: 220,
      failedCases: 20,
      pendingCases: 10,
    },
    coverage: {
      e2eCoverage: 85.5,
      unitTestCoverage: 92.3,
    },
    reports: [
      {
        reportId: 'report-m-001',
        type: 'manual',
        coveragePercentage: 78.5,
        cases: [
          {
            caseId: 'case-m-001',
            name: '登录功能测试',
            status: 'success',
            successCount: 15,
            failureCount: 0,
          },
          {
            caseId: 'case-m-002',
            name: '用户权限验证',
            status: 'failure',
            successCount: 8,
            failureCount: 3,
          },
          {
            caseId: 'case-m-003',
            name: '数据导出功能',
            status: 'success',
            successCount: 12,
            failureCount: 1,
          },
        ],
      },
      {
        reportId: 'report-a-001',
        type: 'automated',
        coveragePercentage: 92.3,
        cases: [
          {
            caseId: 'case-a-001',
            name: 'API响应测试',
            status: 'success',
            successCount: 120,
            failureCount: 2,
          },
          {
            caseId: 'case-a-002',
            name: '性能压力测试',
            status: 'success',
            successCount: 45,
            failureCount: 0,
          },
          {
            caseId: 'case-a-003',
            name: 'UI组件渲染测试',
            status: 'failure',
            successCount: 67,
            failureCount: 12,
          },
          {
            caseId: 'case-a-004',
            name: '数据库连接测试',
            status: 'success',
            successCount: 30,
            failureCount: 0,
          },
        ],
      },
    ],
    aggregationProgress: {
      total: 100,
      current: 65,
      status: 'aggregating',
    },
  },
  {
    id: 'pipeline-002',
    name: '特性分支流水线',
    pipelineId: '#67890',
    commitId: 'e4f5g6h',
    commitMessage: 'fix: 修复登录页面样式问题',
    hasReported: true,
    lastUpdated: '2024-02-27 09:15:22',
    progress: {
      totalCases: 180,
      successCases: 160,
      failedCases: 15,
      pendingCases: 5,
    },
    coverage: {
      e2eCoverage: 78.9,
      unitTestCoverage: 88.5,
    },
    reports: [
      {
        reportId: 'report-m-002',
        type: 'manual',
        coveragePercentage: 65.8,
        cases: [
          {
            caseId: 'case-m-004',
            name: '新功能测试',
            status: 'pending',
            successCount: 5,
            failureCount: 0,
          },
          {
            caseId: 'case-m-005',
            name: '兼容性测试',
            status: 'success',
            successCount: 10,
            failureCount: 2,
          },
        ],
      },
      {
        reportId: 'report-a-002',
        type: 'automated',
        coveragePercentage: 88.1,
        cases: [
          {
            caseId: 'case-a-005',
            name: '单元测试套件',
            status: 'success',
            successCount: 230,
            failureCount: 15,
          },
          {
            caseId: 'case-a-006',
            name: '集成测试',
            status: 'failure',
            successCount: 42,
            failureCount: 8,
          },
        ],
      },
    ],
    aggregationProgress: {
      total: 100,
      current: 100,
      status: 'completed',
    },
  },
  {
    id: 'pipeline-003',
    name: '发布候选流水线',
    pipelineId: '#24680',
    commitId: '',
    commitMessage: '',
    hasReported: false,
    lastUpdated: '2024-02-25 14:20:10',
    progress: {
      totalCases: 0,
      successCases: 0,
      failedCases: 0,
      pendingCases: 0,
    },
    coverage: {
      e2eCoverage: 0,
      unitTestCoverage: 0,
    },
    aggregationProgress: {
      total: 0,
      current: 0,
      status: 'failed',
    },
  },
];

// 状态标签组件
const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'success':
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          成功
        </Tag>
      );
    case 'failure':
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          失败
        </Tag>
      );
    case 'pending':
      return (
        <Tag color="warning" icon={<WarningOutlined />}>
          待处理
        </Tag>
      );
    default:
      return <Tag color="default">未知</Tag>;
  }
};

// 覆盖率进度条组件
const CoverageProgress: React.FC<{ percentage: number; width?: string }> = ({
  percentage,
  width = 'w-20',
}) => {
  let color = 'red';
  if (percentage >= 80) color = 'green';
  else if (percentage >= 60) color = 'blue';
  else if (percentage >= 40) color = 'orange';

  return (
    <Tooltip title={`覆盖率: ${percentage.toFixed(1)}%`}>
      <Progress
        percent={percentage.toFixed(1)}
        size="small"
        status={percentage < 60 ? 'exception' : 'active'}
        strokeColor={color}
        style={{
          width: '80px',
        }}
        // className={width}
      />
    </Tooltip>
  );
};

// 聚合进度组件
const AggregationProgress: React.FC<{ progress: AggregationProgress }> = ({
  progress,
}) => {
  const percentage = (progress.current / progress.total) * 100;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-gray-500 text-nowrap">进度:</span>
        <Progress
          percent={percentage}
          size="small"
          status={
            progress.status === 'completed'
              ? 'success'
              : progress.status === 'failed'
                ? 'exception'
                : 'active'
          }
          className="w-40"
        />
      </div>
      <span className="text-gray-500">
        {progress.current} / {progress.total}
      </span>
      {progress.status === 'aggregating' && (
        <Badge status="processing" text="聚合中" />
      )}
      {progress.status === 'completed' && (
        <Badge status="success" text="聚合完成" />
      )}
      {progress.status === 'failed' && <Badge status="error" text="聚合失败" />}
    </div>
  );
};

// 新增：覆盖率指标组件
const CoverageMetrics: React.FC<{ coverage: CoverageMetrics }> = ({
  coverage,
}) => {
  return (
    <div className="flex items-center space-x-6">
      <div className="flex items-center space-x-2">
        <Tooltip title="端到端测试覆盖率">
          <span className="font-medium">E2E覆盖率:</span>
        </Tooltip>
        <CoverageProgress percentage={coverage.e2eCoverage} width="w-28" />
      </div>
      <div className="flex items-center space-x-2">
        <Tooltip title="单元测试覆盖率">
          <span className="font-medium">单测覆盖率:</span>
        </Tooltip>
        <CoverageProgress percentage={coverage.unitTestCoverage} width="w-28" />
      </div>
    </div>
  );
};

// 搜索区域组件
interface SearchAreaProps {
  onSearch: (value: string) => void;
  onTypeChange: (type: string) => void;
  searchValue: string;
  selectedType: string;
}

const SearchArea: React.FC<SearchAreaProps> = ({
  onSearch,
  onTypeChange,
  searchValue,
  selectedType,
}) => {
  return (
    <div className="flex items-center justify-between mb-4  p-4 rounded-lg border border-gray-200">
      {/*<div className="flex-1 max-w-md">*/}
      {/*  <Input*/}
      {/*    placeholder="搜索 Commit ID 或信息..."*/}
      {/*    prefix={<SearchOutlined className="text-gray-400" />}*/}
      {/*    value={searchValue}*/}
      {/*    onChange={(e) => onSearch(e.target.value)}*/}
      {/*    className="w-full"*/}
      {/*    allowClear*/}
      {/*  />*/}
      {/*</div>*/}
      <div className="ml-4">
        <Radio.Group
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="unit">单元测试</Radio.Button>
          <Radio.Button value="e2e">E2E测试</Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );
};

// 主组件
const PipelineCoverageDetails: React.FC = () => {
  const [activePipeline, setActivePipeline] = useState<string>(
    mockPipelines[0].id,
  );
  const [searchValue, setSearchValue] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [coverageDetailOpen, setCoverageDetailOpen] = useState(false);

  // 根据搜索条件筛选流水线
  const filteredPipelines = useMemo(() => {
    return mockPipelines.filter((pipeline) => {
      const matchesSearch = searchValue
        ? pipeline.commitId.toLowerCase().includes(searchValue.toLowerCase()) ||
          pipeline.commitMessage
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        : true;

      if (!matchesSearch) return false;

      // 根据测试类型筛选
      if (selectedType === 'unit') {
        return pipeline.coverage.unitTestCoverage > 0;
      } else if (selectedType === 'e2e') {
        return pipeline.coverage.e2eCoverage > 0;
      }

      return true;
    });
  }, [searchValue, selectedType]);

  const caseColumns: TableProps<CaseData>['columns'] = [
    {
      title: 'Report ID',
      dataIndex: 'caseId',
      key: 'caseId',
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
              src={`/gitproviders/${index % 2 === 1 ? 'mpaas.svg' : 'mpaas.svg'}`}
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
            / {rate.toFixed(1)}%
          </span>
        );
      },
    },
    {
      title: '覆盖率',
      key: 'coverage',
      width: 120,
      render: (_, record, index) => {
        // 这里简单假设每个 case 的覆盖率和 report 的覆盖率相同，可根据实际情况修改
        const report = filteredPipelines
          .find((pipeline) => pipeline.id === activePipeline)
          ?.reports?.flatMap((report) => report.cases)
          .find((caseData) => caseData.caseId === record.caseId);
        const coveragePercentage = report ? 85 : 0;
        return <CoverageProgress percentage={coveragePercentage} />;
      },
    },
  ];

  // 更新 pipeline tab 的渲染，添加 commit 信息
  const pipelineTabs: TabsProps['items'] = filteredPipelines.map(
    (pipeline, index) => ({
      key: pipeline.id,
      label: (
        <Space>
          <img
            className={'w-[16px]'}
            src={`/gitproviders/${index % 2 === 1 ? 'gitlab' : 'mpaas'}.svg`}
            alt=""
          />
          {/*<GitlabFilled className="mr-2 text-[#E24329]" />*/}
          <span className="font-medium">{pipeline.pipelineId}</span>
          {!pipeline.hasReported && <Badge status="warning" className="ml-2" />}
        </Space>
      ),
      children: (
        <div className="p-4">
          {!pipeline.hasReported ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="text-center">
                  <p className="text-yellow-500 font-medium mb-2">
                    该流水线尚未上报覆盖率数据
                  </p>
                  <p className="text-gray-500">
                    最后更新时间: {pipeline.lastUpdated}
                  </p>
                  <p className="text-gray-500">流水线名称: {pipeline.name}</p>
                </div>
              }
            />
          ) : (
            <div className="">
              {/*<Divider/>*/}
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

                  <CoverageDetail
                    open={coverageDetailOpen}
                    onClose={() => {
                      setCoverageDetailOpen(false);
                    }}
                  />

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
                    <CoverageProgress
                      percentage={pipeline.coverage.e2eCoverage}
                      width="w-32"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tooltip title="单元测试覆盖率">
                      <span className="font-medium">单测覆盖率:</span>
                    </Tooltip>
                    <CoverageProgress
                      percentage={pipeline.coverage.unitTestCoverage}
                      width="w-32"
                    />
                  </div>
                </div>
                <AggregationProgress progress={pipeline.aggregationProgress} />
              </div>

              {/* Collapse 部分保持不变 */}
              {pipeline.reports && (
                <Collapse
                  defaultActiveKey={['manual', 'automated']}
                >
                  <Collapse.Panel
                    key="manual"
                    header={
                      <div className="flex items-center justify-between w-full pr-8">
                        <Space className="font-medium">
                          <UserOutlined />
                          手工测试覆盖率
                        </Space>
                        {pipeline.reports.find((r) => r.type === 'manual') && (
                          <CoverageProgress
                            percentage={
                              pipeline.reports.find((r) => r.type === 'manual')!
                                .coveragePercentage
                            }
                          />
                        )}
                      </div>
                    }
                    className="border-0"
                  >
                    {pipeline.reports
                      .filter((r) => r.type === 'manual')
                      .map((report) => (
                        <div key={report.reportId} className="mb-4">
                          <Table
                            columns={caseColumns}
                            dataSource={report.cases}
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
                        {pipeline.reports.find(
                          (r) => r.type === 'automated',
                        ) && (
                          <CoverageProgress
                            percentage={
                              pipeline.reports.find(
                                (r) => r.type === 'automated',
                              )!.coveragePercentage
                            }
                          />
                        )}
                      </div>
                    }
                    className="border-0"
                  >
                    {pipeline.reports
                      .filter((r) => r.type === 'automated')
                      .map((report) => (
                        <div key={report.reportId} className="mb-4">
                          <Table
                            columns={caseColumns}
                            dataSource={report.cases}
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
          )}
        </div>
      ),
    }),
  );

  return (
    <div className="   shadow w-full">
      <div className="mb-4">
        {/* 添加 commit 信息显示 */}
        <div className=" p-3  text-sm">
          <div className="flex items-center text-gray-600">
            {/*<RedoOutlined />*/}
            <span className="font-medium mr-2">Commit:</span>
            <a
              style={{
                textDecoration: 'underline',
              }}
            >
              {'x8qvqb7'}
            </a>
            <span className="ml-2">{'feat: Add new feature 0'}</span>
          </div>
        </div>
      </div>

      <Tabs
        items={pipelineTabs}
        activeKey={activePipeline}
        onChange={setActivePipeline}
        // type="card"
        className="pipeline-tabs"
      />
    </div>
  );
};

export default PipelineCoverageDetails;
