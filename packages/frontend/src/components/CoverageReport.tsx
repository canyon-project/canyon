import { useQuery } from '@apollo/client';
import { useRequest } from 'ahooks';
import { Spin } from 'antd';
import axios from 'axios';
import Report from 'canyon-report';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  CodeDiffChangedLinesDocument,
  RepoDocument,
} from '@/helpers/backend/gen/graphql.ts';
import { handleSelectFileBySubject } from '@/helpers/report';

function CoverageReportContent({ repo }: { repo: { id: string } }) {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const { refetch: codeDiffChangedLinesRefetch } = useQuery(
    CodeDiffChangedLinesDocument,
  );
  const subjectID = params.subjectID;
  const subject = params.subject as
    | 'commit'
    | 'commits'
    | 'pull'
    | 'pulls'
    | 'multiple-commits'
    | 'multi-commits'
    | undefined;
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  const provider = searchParams.get('provider') || 'gitlab';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';
  const [activatedPath, setActivatedPath] = useState(
    params['*']?.replace('-/', ''),
  );

  // 组装基础路径（带上现有 query），供选择文件时调整 URL
  const sp = searchParams.toString();
  const basePathPrefix = `/report/-/${params.provider}/${params.org}/${params.repo}/${params.subject}/${params.subjectID}`;
  const basePath = sp ? `${basePathPrefix}?${sp}` : basePathPrefix;

  const subjectForQuery:
    | 'commit'
    | 'commits'
    | 'pull'
    | 'pulls'
    | 'multiple-commits'
    | 'multi-commits' = (subject ?? 'commit') as
    | 'commit'
    | 'commits'
    | 'pull'
    | 'pulls'
    | 'multiple-commits'
    | 'multi-commits';

  const { data, loading } = useRequest(
    () =>
      axios('/api/coverage/summary/map', {
        params: {
          subject: subjectForQuery,
          subjectID,
          buildProvider,
          buildID,
          repoID: repo.id,
          provider,
          reportID,
          reportProvider,
        },
      }).then(({ data }) => data),
    { refreshDeps: [repo?.id, subject, subjectID] },
  );

  const onSelect = (val: string) => {
    setActivatedPath(val);
    if (!val.includes('.')) {
      return Promise.resolve({
        fileContent: '',
        fileCoverage: {},
        fileCodeChange: [],
      });
    }
    if (!subject) {
      return Promise.resolve({
        fileContent: '',
        fileCoverage: {},
        fileCodeChange: [],
      });
    }
    return handleSelectFileBySubject({
      repoID: repo.id,
      subject,
      subjectID: String(subjectID),
      filepath: val,
      provider,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
      // @ts-expect-error
      codeDiffChangedLinesRefetch,
    }).then((res) => ({
      fileContent: res.fileContent,
      fileCoverage: res.fileCoverage,
      fileCodeChange: res.fileCodeChange,
    }));
  };

  // 实现与 CoverageFileDrawer 类似的导航插入逻辑
  const getToFilePath = useCallback(
    (path: string) => {
      const qIndex = basePath.indexOf('?');
      if (qIndex >= 0) {
        const prefix = basePath.slice(0, qIndex);
        const qs = basePath.slice(qIndex + 1);
        navigate(`${prefix}${path}?${qs}`);
      } else {
        navigate(`${basePath}${path}`);
      }
    },
    [basePath, navigate],
  );

  useEffect(() => {
    if (subjectID != null) {
      getToFilePath(`/-/${activatedPath || ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatedPath, subjectID, getToFilePath]);

  return (
    <Spin spinning={loading}>
      <div
        style={{
          height: 'calc(100vh - 12px)',
        }}
      >
        <Report
          name={params.repo}
          value={activatedPath}
          onSelect={onSelect}
          dataSource={data}
        />
      </div>
    </Spin>
  );
}

function CoverageReport() {
  const params = useParams();
  const id = `${params.org}/${params.repo}`;
  const { data, loading } = useQuery(RepoDocument, {
    variables: {
      id: id,
    },
  });
  const repo = data?.repo;
  if (loading || !repo) {
    return <Spin spinning={true} />;
  }
  return (
    <div className='p-[6px]'>
      <CoverageReportContent repo={repo} />
    </div>
  );
}

export default CoverageReport;
