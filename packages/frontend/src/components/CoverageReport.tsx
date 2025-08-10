import {useParams, useSearchParams} from "react-router-dom";
import Report from 'canyontest-report';
import {useState} from "react";
import {useRequest} from "ahooks";
import axios from "axios";
import {handleSelectFileBySubject} from "@/helper";
import {Spin} from "antd";

function CoverageReport() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const subjectID = params.subjectID
  const subject = params.subject
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';

  const provider = searchParams.get('provider') || 'gitlab';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';

  const [activatedPath, setActivatedPath] = useState(params['*']?.replace('-/',''));

  // 获取仓库信息（org/repo 需要 base64 编码）
  const { data: repo } = useRequest(() => {
    if (!params.org || !params.repo) return Promise.resolve(null);
    const key = btoa(`${params.org}/${params.repo}`);
    return axios.get(`/api/repo/${key}`).then(r => r.data);
  }, { refreshDeps: [params.org, params.repo] });

  const { data, loading } = useRequest(
    () =>
      axios(`/api/coverage/summary/map`, {
        params: {
          subject,
          subjectID,
          buildProvider,
          buildID,
          repoID: repo?.id,
          provider,
          reportID,
          reportProvider,
        },
      }).then(({ data }) => data),
    {},
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
    return handleSelectFileBySubject({
      repoID: repo?.id,
      subject: subject as any,
      subjectID: String(subjectID),
      filepath: val,
      provider,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
    }).then((res) => {
      return {
        fileContent: res.fileContent,
        fileCoverage: res.fileCoverage,
        fileCodeChange: res.fileCodeChange,
      };
    });
  };
  return <Spin spinning={loading}>
    <Report value={activatedPath} onSelect={onSelect} dataSource={data}/>
  </Spin>
}
export default CoverageReport
