'use client';

import { FC } from 'react';
import { useState } from 'react';
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
  Divider, Spin,
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
import { useRequest } from 'ahooks';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
// import { useQuery } from '@apollo/client';
// import { GetProjectCommitCoverageDocument } from '@/graphql/gen/graphql.ts';

// 更新数据类型定义
interface CaseData {
  reportID: string;
  name: string;
  status: 'success' | 'failure' | 'pending';
  successCount: number;
  failureCount: number;
  reportProvider: string;
}

interface CoverageReport {
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
interface BuildProgress {
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

// 更新 BuildData 接口，添加 commit 相关信息
interface BuildData {
  id: string;
  name: string;
  buildID: string;
  sha: string;
  commitMessage: string;
  hasReported: boolean;
  lastUpdated: string;
  progress: BuildProgress;
  coverage: CoverageMetrics;
  reports?: CoverageReport[];
  aggregationProgress: AggregationProgress;
}

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
    <Tooltip title={`覆盖率: ${percentage}%`}>
      <Progress
        percent={percentage}
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
  // const percentage = (progress.current / progress.total) * 100;

  const percentage = 100;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-gray-500 text-nowrap">进度:</span>
        <Progress
          percent={percentage}
          size="small"
          status={
            progress?.status === 'completed'
              ? 'success'
              : progress?.status === 'failed'
                ? 'exception'
                : 'active'
          }
          className="w-40"
        />
      </div>
      <span className="text-gray-500">
        10
        {/*{progress.current} / {progress.total}*/}
      </span>
      {progress?.status === 'aggregating' && (
        <Badge status="processing" text="聚合中" />
      )}
      {progress?.status === 'completed' && (
        <Badge status="success" text="聚合完成" />
      )}
      {progress?.status === 'failed' && (
        <Badge status="error" text="聚合失败" />
      )}
    </div>
  );
};

// 主组件
const CommitsDetail: FC<{
  selectedCommit: string;
}> = ({ selectedCommit }) => {
  console.log(selectedCommit, 'selectedCommit');
  const [activeBuild, setActiveBuild] = useState<string>('27932502');
  const params = useParams();
  console.log(params, 'params');
  const repoID = encodeURIComponent(params.org + '/' + params.repo);
  const { data, loading } = useRequest(
    () => {
      return axios
        .get(`/api/repo/${repoID}/commits/${selectedCommit?.sha}`)
        .then((res) => res.data);
    },
    {
      refreshDeps: [selectedCommit],
    },
  );

  const [coverageDetailOpen, setCoverageDetailOpen] = useState(false);

  // 根据搜索条件筛选流水线

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
    // {
    //   title: '覆盖率',
    //   key: 'coverage',
    //   width: 120,
    // },
  ];

  // 更新 pipeline tab 的渲染，添加 commit 信息
  const buildTabs: TabsProps['items'] = (data || [])
    .map((i) => {
      return {
        ...i,
        hasReported: true,
      };
    })
    .map((build, index) => ({
      key: build.buildID,
      label: (
        <Space>
          <img
            className={'w-[16px]'}
            src={`/providers/${index % 2 === 1 ? 'gitlab' : 'mpaas'}.svg`}
            alt=""
          />
          {/*<GitlabFilled className="mr-2 text-[#E24329]" />*/}
          <span className="font-medium">{build.buildID}</span>
          {!build.hasReported && <Badge status="warning" className="ml-2" />}
        </Space>
      ),
      children: (
        <div className="p-4">
          {!build.hasReported ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="text-center">
                  <p className="text-yellow-500 font-medium mb-2">
                    该流水线尚未上报覆盖率数据
                  </p>
                  <p className="text-gray-500">
                    最后更新时间: {build.lastUpdated}
                  </p>
                  <p className="text-gray-500">构建名称: {build.name}</p>
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
                      percentage={build?.coverage?.e2eCoverage}
                      width="w-32"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tooltip title="单元测试覆盖率">
                      <span className="font-medium">单测覆盖率:</span>
                    </Tooltip>
                    <CoverageProgress
                      percentage={build?.coverage?.unitTestCoverage}
                      width="w-32"
                    />
                  </div>
                </div>
                <AggregationProgress progress={build?.aggregationProgress} />
              </div>

              {/* Collapse 部分保持不变 */}
              {build.reports && (
                <Collapse defaultActiveKey={['manual', 'automated']}>
                  <Collapse.Panel
                    key="manual"
                    header={
                      <div className="flex items-center justify-between w-full pr-8">
                        <Space className="font-medium">
                          <UserOutlined />
                          手工测试覆盖率
                        </Space>
                        {/*{JSON.stringify(build.reports)}*/}
                        {build.reports?.find((r) => r.type === 'manual') && (
                          <CoverageProgress
                            percentage={
                              build.reports?.find((r) => r.type === 'manual')!
                                .coveragePercentage
                            }
                          />
                        )}
                      </div>
                    }
                    className="border-0"
                  >
                    {build.reports
                      ?.filter((r) => r.type === 'manual')
                      .map((report) => (
                        <div key={report.reportID} className="mb-4">
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
                        {build.reports.find((r) => r.type === 'automated') && (
                          <CoverageProgress
                            percentage={
                              build.reports.find((r) => r.type === 'automated')!
                                .coveragePercentage
                            }
                          />
                        )}
                      </div>
                    }
                    className="border-0"
                  >
                    {build.reports
                      .filter((r) => r.type === 'automated')
                      .map((report) => (
                        <div key={report.reportID} className="mb-4">
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
    }));

  return (
    <div className="shadow" style={{ flex: 1 }}>
      <Spin spinning={loading}>
        {!loading && (
          <>
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
                    {selectedCommit?.sha}
                  </a>
                  <span className="ml-2">{selectedCommit?.commitMessage}</span>
                </div>
              </div>
            </div>

            <Tabs
              items={buildTabs}
              activeKey={activeBuild}
              onChange={setActiveBuild}
              // type="card"
              className="build-tabs"
            />
          </>
        )}
      </Spin>
    </div>
  );
};

export default CommitsDetail;
