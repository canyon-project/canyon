import { CanyonReport } from '@canyonjs/report-component';
import { useRequest } from 'ahooks';
import { Spin } from 'antd';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const CoverageReport = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [activatedPath, setActivatedPath] = useState(
    params['*']?.replace('-/', '') || '',
  );

  const subjectID = params.subjectID;
  const subject = params.subject as
    | 'commit'
    | 'commits'
    | 'pull'
    | 'pulls'
    | 'multiple-commits'
    | undefined;
  const buildTarget = searchParams.get('build_target') || '';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';
  const provider = params.provider as string;
  const org = params.org as string;
  const repo = params.repo as string;

  const subjectForQuery:
    | 'commit'
    | 'commits'
    | 'pull'
    | 'pulls'
    | 'multiple-commits' = (subject ?? 'commit') as
    | 'commit'
    | 'commits'
    | 'pull'
    | 'pulls'
    | 'multiple-commits';

  // 获取 repoID
  const { data: repoData } = useRequest(
    async () => {
      const repoId = `${org}/${repo}`;
      const resp = await fetch(`/api/repos/${encodeURIComponent(repoId)}`, {
        credentials: 'include',
      });
      if (resp.ok) {
        return resp.json();
      }
      return null;
    },
    { refreshDeps: [org, repo] },
  );

  const repoID = repoData?.id || '';

  const { data: mapData, loading } = useRequest(
    () =>
      axios('/api/coverage/map', {
        params: {
          subject: subjectForQuery,
          subjectID,
          buildTarget,
          repoID,
          provider,
          reportID,
          reportProvider,
        },
      }).then(({ data }) => data),
    {
      refreshDeps: [
        subject,
        subjectID,
        buildTarget,
        reportID,
        reportProvider,
        repoID,
      ],
      ready: !!repoID, // 只有当 repoID 存在时才请求
    },
  );

  // 将对象格式转换为数组格式
  const data = mapData
    ? Object.values(mapData).map((item: any) => ({
        ...item,
        path: item.path || '',
      }))
    : [];

  const onSelect = useCallback(
    async (val: string) => {
      setActivatedPath(val);
      if (!val.includes('.')) {
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: [],
        };
      }
      if (!subject || !repoID) {
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: [],
        };
      }

      try {
        // 从 map 数据中查找文件信息
        const fileData = data?.find((item: any) => item.path === val);
        if (fileData) {
          return {
            fileContent: fileData.source || '',
            fileCoverage: fileData || {},
            fileCodeChange: fileData.changedLines || [],
          };
        }

        // 如果 map 数据中没有，尝试通过 API 获取
        // TODO: 等待后端实现文件 API 端点
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: [],
        };
      } catch (error) {
        console.error('Failed to fetch file:', error);
        return {
          fileContent: '',
          fileCoverage: {},
          fileCodeChange: [],
        };
      }
    },
    [subject, repoID, data],
  );

  const defaultOnlyShowChanged = subject === 'multiple-commits';

  return (
    <Spin spinning={loading}>
      <div
        style={{
          height: 'calc(100vh - 12px)',
        }}
      >
        <CanyonReport
          name={repo}
          value={activatedPath}
          onSelect={onSelect}
          dataSource={data}
        />
      </div>
    </Spin>
  );
};

export default CoverageReport;
