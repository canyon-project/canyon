'use client';

import { FC, useState } from 'react';
import type { TabsProps } from 'antd';
import { Badge, Empty, Space, Spin, Tabs } from 'antd';
import { useRequest } from 'ahooks';
import axios from 'axios';
import { useParams, useSearchParams } from 'react-router-dom';
import CoverageOverviewPanel from '@/pages/ProjectDetailPage/CommitsTab/CommitsDetail/CoverageOverviewPanel.tsx';

import CoverageDetail from '@/components/CoverageDetail.tsx';
import RIf from '@/components/RIf.tsx';

// 更新数据类型定义
export interface CaseData {
  reportID: string;
  name: string;
  status: 'success' | 'failure' | 'pending';
  successCount: number;
  failureCount: number;
  reportProvider: string;
}

// 主组件
const CommitsDetail = ({
  selectedCommit,
  selectedBuildID,
  onBuildIDChange,
  repo,
}) => {
  console.log(selectedCommit,'!!!!!')
  const [searchParams, setSearchParams] = useSearchParams();
  // const [activeBuild, setActiveBuild] = useState<string>();
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
      onSuccess(v) {
        console.log(v,'???')
        onBuildIDChange(v[0]);
      },
    },
  );

  const [coverageDetailOpen, setCoverageDetailOpen] = useState(
    searchParams.get('coverage_detail_open') === 'true',
  );

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
            src={`/providers/${build.buildProvider}.svg`}
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
        {/*{JSON.stringify(coverageDetailOpen)}*/}
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
              activeKey={selectedBuildID}
              onChange={(val) => {
                const build = (data || []).find((item) => {
                  return item.buildID === val;
                });

                onBuildIDChange(build);
              }}
              // type="card"
              className="build-tabs"
            />

            <RIf condition={coverageDetailOpen}>
              <CoverageDetail
                repo={repo}
                open={coverageDetailOpen}
                onClose={() => {
                  setCoverageDetailOpen(false);
                  searchParams.set('coverage_detail_open', 'false');
                  setSearchParams(searchParams);
                }}
              />
            </RIf>
          </>
        )}
      </Spin>
    </div>
  );
};

export default CommitsDetail;
