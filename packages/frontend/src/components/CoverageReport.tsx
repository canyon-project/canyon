import {useParams, useSearchParams} from "react-router-dom";
import Report from 'canyontest-report';
import {useState} from "react";
import {useRequest} from "ahooks";
import axios from "axios";
import {handleSelectFile} from "@/helper";
import {Spin} from "antd";

function CoverageReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const subjectID = params.subjectID
  const subject = params.subject
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  // const repoID = searchParams.get('repo_id') || repo.id;
  const provider = searchParams.get('provider') || 'gitlab';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';

  const [activatedPath, setActivatedPath] = useState(params['*']?.replace('-/',''));

  const { data, loading } = useRequest(
    () =>
      axios(`/api/coverage/summary/map`, {
        params: {
          subject,
          subjectID,
          buildProvider,
          buildID,
          repoID: '86927',
          provider,
          reportID,
          reportProvider,
        },
      }).then(({ data }) => data),
    {},
  );

  const onSelect = (val) => {
    setActivatedPath(val);
    if (!val.includes('.')) {
      return Promise.resolve({
        fileContent: '',
        fileCoverage: {},
        fileCodeChange: [],
      });
    }
    return handleSelectFile({
      filepath: val,
      reportID,
      subject,
      subjectID,
      repoID:'86927',
      buildID,
      buildProvider,
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
