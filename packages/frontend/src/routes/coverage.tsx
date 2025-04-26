import Report from 'canyon-report';
import { useRequest } from 'ahooks';
import axios from 'axios';
import { Spin } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
const CoveragePage = () => {
  const [URLSearchParams] = useSearchParams();

  const sha = URLSearchParams.get('sha');
  const buildProvider = URLSearchParams.get('build_provider');
  const buildID = URLSearchParams.get('build_id');
  const repoID = URLSearchParams.get('repo_id');
  const provider = URLSearchParams.get('provider');

  const { data, loading } = useRequest(
    () =>
      axios(`/api/project/coverage`, {
        params: {
          sha: sha,
          buildProvider: buildProvider,
          buildID: buildID,
          repoID: repoID,
          provider: provider,
        },
      }).then(({ data }) => data),
    {},
  );

  return (
    <Spin spinning={loading}>
      <Editor
        value={JSON.stringify(data, null, 2)}
        height={'500px'}
        language={'json'}
      />
      <Report dataSource={data} />
    </Spin>
  );
};

export default CoveragePage;
