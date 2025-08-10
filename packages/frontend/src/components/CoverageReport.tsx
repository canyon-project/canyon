import {useParams, useSearchParams} from "react-router-dom";
import Report from 'canyontest-report';
import {useState} from "react";
import {useRequest} from "ahooks";
import axios from "axios";
import {handleSelectFileBySubject} from "@/helper";
import {Spin} from "antd";

function CoverageReportContent({ repo }: { repo: any }) {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const subjectID = params.subjectID;
  const subject = params.subject as any;
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  const provider = searchParams.get('provider') || 'gitlab';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';
  const [activatedPath, setActivatedPath] = useState(params['*']?.replace('-/',''));

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
