import { useQuery } from '@apollo/client';
import { Badge, Space, Spin, Tabs, type TabsProps } from 'antd';
import { useEffect } from 'react';
import { CoverageOverviewDocument } from '@/helpers/backend/gen/graphql.ts';
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

  // 当没有 selectedBuildID 且数据已加载时，默认选中第一个并触发 onChange
  useEffect(() => {
    if (!selectedBuildID && Array.isArray(data) && data.length > 0) {
      const first = data[0];
      onChange({ buildID: first.buildID, buildProvider: first.buildProvider });
    }
  }, [selectedBuildID, data, onChange]);

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
          <CoverageOverviewPanel build={build as unknown as Build} />
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
      />
    </Spin>
  );
};

export default CommitCoverageOverview;
