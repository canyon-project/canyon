import CoverageOverviewPanel from '@/pages/index/[provider]/[org]/[repo]/index/commits/index/[sha]/views/CoverageOverviewPanel.tsx';
import { useRequest } from 'ahooks';
import { Badge, Empty, Space, Spin, Tabs, type TabsProps } from 'antd';
import axios from 'axios';

const CommitCoverageOverview = ({ commit, repo, onChange, selectedBuildID }) => {
  const { data, loading } = useRequest(
    () => {
      return axios
        .get(
          `/api/coverage/overview?subject=commit&subjectID=${commit?.sha}&provider=gitlab&repoID=${repo.id}`
        )
        .then((res) => res.data);
    },
    {
      refreshDeps: [commit],
      onSuccess(_v) {},
    }
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
    .map((build, _index) => ({
      key: build.buildID,
      label: (
        <Space>
          <img className={'w-[16px]'} src={`/providers/${build.buildProvider}.svg`} alt='' />
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
                  <p className='mb-2 font-medium text-yellow-500'>该流水线尚未上报覆盖率数据</p>
                  <p className='text-gray-500'>最后更新时间: {build.lastUpdated}</p>
                  <p className='text-gray-500'>构建名称: {build.name}</p>
                </div>
              }
            />
          ) : (
            <CoverageOverviewPanel build={build} commit={commit} />
          )}
        </div>
      ),
    }));

  return (
    <Spin spinning={loading}>
      <Tabs
        items={buildTabs}
        activeKey={selectedBuildID}
        onChange={(val) => {
          const build = (data || []).find((item) => {
            return item.buildID === val;
          });
          onChange({
            buildID: build.buildID,
            buildProvider: build.buildProvider,
          });
        }}
        // type="card"
        className='build-tabs'
      />
    </Spin>
  );
};

export default CommitCoverageOverview;
