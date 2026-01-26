import { CanyonReport } from '@canyonjs/report-component';
import { Spin } from 'antd';
import {
  useCoverageSummaryMap,
  useFileSelect,
  useReportParams,
  useRepoID,
} from './hooks';

const ReportIndependent = () => {
  // 获取路由参数和查询参数
  const { routeParams, queryParams, subjectForQuery, activatedPath } =
    useReportParams();

  // 获取 repoID
  const repoID = useRepoID(routeParams.org, routeParams.repo);

  // 获取覆盖率摘要映射数据（只调用一次）
  const { data, loading } = useCoverageSummaryMap({
    subjectForQuery,
    subjectID: routeParams.subjectID,
    buildTarget: queryParams.buildTarget,
    repoID,
    provider: routeParams.provider,
    reportID: queryParams.reportID,
    reportProvider: queryParams.reportProvider,
    scene: queryParams.scene,
  });

  // 处理文件选择逻辑
  const { onSelect } = useFileSelect({
    routeParams,
    queryParams,
    subjectForQuery,
    repoID,
    currentPath: activatedPath,
  });

  return (
    <Spin spinning={loading}>
      <div className={'p-[6px]'}>
        <div
          style={{
            height: 'calc(100vh - 12px)',
          }}
        >
          <CanyonReport
            name={routeParams.repo}
            value={activatedPath}
            onSelect={onSelect}
            dataSource={data}
          />
        </div>
      </div>
    </Spin>
  );
};

export default ReportIndependent;
