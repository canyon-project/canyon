import Report from 'canyon-report';
import { useRequest } from 'ahooks';
import axios from 'axios';
import { Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { handleSelectFile } from '@/helper';
const CoveragePage = () => {
  const [URLSearchParams, setURLSearchParams] = useSearchParams();

  const sha = URLSearchParams.get('sha') || '';
  const buildProvider = URLSearchParams.get('build_provider') || '';
  const buildID = URLSearchParams.get('build_id') || '';
  const repoID = URLSearchParams.get('repo_id') || '';
  const provider = URLSearchParams.get('provider') || '';
  const reportID = URLSearchParams.get('report_id') || '';
  const reportProvider = URLSearchParams.get('report_provider') || '';

  const [activatedPath, setActivatedPath] = useState(
    URLSearchParams.get('file_path') || '',
  );

  const { data, loading } = useRequest(
    () =>
      axios(`/api/coverage/summary/map`, {
        params: {
          sha: sha,
          buildProvider: buildProvider,
          buildID: buildID,
          repoID: repoID,
          provider: provider,
          reportID,
          reportProvider,
        },
      }).then(({ data }) => data.data),
    {},
  );

  const nav = useNavigate();

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
      sha,
      repoID,
      buildID,
      buildProvider
    }).then((res) => {
      return {
        fileContent: res.fileContent,
        fileCoverage: res.fileCoverage,
        fileCodeChange: res.fileCodeChange,
      };
    });
  };

  // 导航
  useEffect(() => {
    URLSearchParams.set('file_path', activatedPath);
    setURLSearchParams(URLSearchParams);
  }, [activatedPath]);

  return (
    <Spin spinning={loading}>
      {/*<Editor*/}
      {/*  value={JSON.stringify(data, null, 2)}*/}
      {/*  height={'500px'}*/}
      {/*  language={'json'}*/}
      {/*/>*/}
      <Report value={activatedPath} onSelect={onSelect} dataSource={data} />
    </Spin>
  );
};

export default CoveragePage;
