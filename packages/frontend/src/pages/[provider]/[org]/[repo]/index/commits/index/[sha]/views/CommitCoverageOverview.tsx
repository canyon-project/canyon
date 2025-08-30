import { useQuery } from '@apollo/client';
import { Badge, Empty, Space, Spin, Tabs, type TabsProps } from 'antd';
import { CoverageOverviewDocument } from '@/helpers/backend/gen/graphql.ts';
// import {useRequest} from "ahooks";
// import axios from "axios";
import CoverageOverviewPanel from '@/pages/[provider]/[org]/[repo]/index/commits/index/[sha]/views/CoverageOverviewPanel.tsx';
import type { Build, BuildMode, CommitCoverageOverviewProps } from '@/types';

type UIBuildMode = BuildMode & {
  reportID?: string;
  caseList?: Array<Record<string, unknown>>;
};
type UIBuild = {
  buildID: string;
  buildProvider: string;
  hasReported?: boolean;
  lastUpdated?: string;
  name?: string;
  modeList?: Array<UIBuildMode>;
};

const CommitCoverageOverview: React.FC<CommitCoverageOverviewProps> = ({
  commit,
  repo,
  onChange,
  selectedBuildID,
}) => {
  const { data: d, loading } = useQuery(CoverageOverviewDocument, {
    variables: {
      provider: 'gitlab',
      repoID: repo?.id || '',
      sha: commit?.sha || '',
    },
  });

  const data = (d?.coverageOverview.resultList as unknown as UIBuild[]) || [];

  // 根据搜索条件筛选流水线
  // 更新 pipeline tab 的渲染，添加 commit 信息
  const buildTabs: TabsProps['items'] = (data || [])
    .map((i: UIBuild) => ({ ...i, hasReported: true }))
    .map((build: UIBuild) => ({
      key: build.buildID,
      label: (
        <Space>
          <img
            className={'w-[16px]'}
            src={`/providers/${build.buildProvider}.svg`}
            alt=''
          />
          <span className='font-medium'>{build.buildID}</span>
          {!build.hasReported && <Badge status='warning' className='ml-2' />}
        </Space>
      ),
      children: (
        <div className='p-4'>
          {!build.hasReported ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className='text-center'>
                  <p className='text-yellow-500 font-medium mb-2'>
                    该流水线尚未上报覆盖率数据
                  </p>
                  <p className='text-gray-500'>
                    最后更新时间: {build.lastUpdated}
                  </p>
                  <p className='text-gray-500'>构建名称: {build.name}</p>
                </div>
              }
            />
          ) : (
            <CoverageOverviewPanel build={build as unknown as Build} />
          )}
        </div>
      ),
    }));

  return (
    <Spin spinning={loading}>
      <Tabs
        items={buildTabs}
        activeKey={selectedBuildID ?? undefined}
        onChange={(val: string) => {
          const build = (data || []).find((item: UIBuild) => {
            return String(item.buildID || '') === String(val || '');
          });
          onChange({
            buildID: String(build?.buildID || ''),
            buildProvider: String(build?.buildProvider || ''),
          });
        }}
        // type="card"
        className='build-tabs'
      />
    </Spin>
  );
};

export default CommitCoverageOverview;
