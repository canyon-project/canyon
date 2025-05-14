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
import CoverageOverviewPanel from "@/pages/ProjectDetailPage/CommitsTab/CommitsDetail/CoverageOverviewPanel.tsx";
// import { useQuery } from '@apollo/client';
// import { GetProjectCommitCoverageDocument } from '@/graphql/gen/graphql.ts';

// 更新数据类型定义
export interface CaseData {
  reportID: string;
  name: string;
  status: 'success' | 'failure' | 'pending';
  successCount: number;
  failureCount: number;
  reportProvider: string;
}

export interface CoverageReport {
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
            <CoverageOverviewPanel
              build={build}
              coverageDetailOpen={coverageDetailOpen}
              setCoverageDetailOpen={setCoverageDetailOpen}
            />
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
