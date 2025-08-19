import CoverageOverviewPanel
  from '@/pages/index/[provider]/[org]/[repo]/index/commits/index/[sha]/views/CoverageOverviewPanel.tsx';
import {useRequest} from 'ahooks';
import {Space, Spin, Tabs, type TabsProps} from 'antd';
import axios from 'axios';
import {CommitCoverageOverviewProps} from '@/types';
import {useEffect} from 'react';

const CommitCoverageOverview = ({ commit, repo, onChange, selectedBuildID }: CommitCoverageOverviewProps) => {
  const { data, loading } = useRequest(
    () => {
      return axios
        .get(
          `/api/coverage/overview?subject=commit&subjectID=${commit?.sha}&provider=gitlab&repoID=${repo?.id}`
        )
        .then((res) => res.data);
    },
    {
      refreshDeps: [commit],
      onSuccess(_v) {},
    }
  );

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
    .map((build: any, _index: number) => ({
      key: build.buildID,
      label: (
        <Space>
          <img className={'w-[16px]'} src={`/providers/${build.buildProvider}.svg`} alt='' />
          <span className='font-medium'>{build.buildID}</span>
        </Space>
      ),
      children: (
        <div className='p-4'>
          <CoverageOverviewPanel build={build} />
        </div>
      ),
    }));
  return (
    <Spin spinning={loading}>
      <Tabs
        items={buildTabs}
        activeKey={selectedBuildID || undefined}
        onChange={(val) => {
          const build = (data || []).find((item: any) => {
            return item.buildID === val;
          });
          onChange({
            buildID: build.buildID,
            buildProvider: build.buildProvider,
          });
        }}
      />
    </Spin>
  );
};

export default CommitCoverageOverview;
