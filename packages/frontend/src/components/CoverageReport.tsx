import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import Report from 'canyontest-report';
import {useEffect, useState} from "react";
import {useRequest} from "ahooks";
import axios from "axios";
import {handleSelectFileBySubject} from "@/helper";
import {Spin} from "antd";

function CoverageReportContent({ repo }: { repo: any }) {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const subjectID = params.subjectID;
  const subject = params.subject as any;
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  const provider = searchParams.get('provider') || 'gitlab';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';
  const [activatedPath, setActivatedPath] = useState(params['*']?.replace('-/',''));

  // 组装基础路径（带上现有 query），供选择文件时调整 URL
  const sp = searchParams.toString();
  const basePathPrefix = `/${params.provider}/${params.org}/${params.repo}/${params.subject}/${params.subjectID}`;
  const basePath = sp ? `${basePathPrefix}?${sp}` : basePathPrefix;

  const { data, loading } = useRequest(
    () => axios(`/api/coverage/summary/map`, {
      params: {
        subject,
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
      return Promise.resolve({ fileContent: '', fileCoverage: {}, fileCodeChange: [] });
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
    }).then((res) => ({
      fileContent: res.fileContent,
      fileCoverage: res.fileCoverage,
      fileCodeChange: res.fileCodeChange,
    }));
  };

  // 实现与 CoverageFileDrawer 类似的导航插入逻辑
  const getToFilePath = (path: string) => {
    const qIndex = basePath.indexOf('?');
    if (qIndex >= 0) {
      const prefix = basePath.slice(0, qIndex);
      const qs = basePath.slice(qIndex + 1);
      navigate(`${prefix}${path}?${qs}`);
    } else {
      navigate(`${basePath}${path}`);
    }
  };

  useEffect(() => {
    if (subjectID != null) {
      getToFilePath(`/-/${activatedPath || ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatedPath, subjectID]);

  return (
    <Spin spinning={loading}>
      <Report value={activatedPath} onSelect={onSelect} dataSource={data}/>
    </Spin>
  );
}

function CoverageReport() {
  const params = useParams();
  const { data: repo, loading } = useRequest(() => {
    if (!params.org || !params.repo) return Promise.resolve(null);
    const key = btoa(`${params.org}/${params.repo}`);
    return axios.get(`/api/repo/${key}`).then(r => r.data);
  }, { refreshDeps: [params.org, params.repo] });

  if (loading || !repo) {
    return <Spin spinning={true} />;
  }
  return <CoverageReportContent repo={repo} />;
}

export default CoverageReport
