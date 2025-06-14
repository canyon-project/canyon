import { Drawer, Spin } from 'antd';
import Report from 'canyon-report';
import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import axios from 'axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { handleSelectFile } from '@/helper';
import { getFirstSix } from '@/helper/getFirstSix.ts';
const CoverageDetail = ({ open, onClose, repo }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  console.log(params);
  const sha = searchParams.get('sha') || '';
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  const repoID = searchParams.get('repo_id') || repo.id;
  const provider = searchParams.get('provider') || 'gitlab';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';

  const [activatedPath, setActivatedPath] = useState(
    searchParams.get('file_path') || '',
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
      buildProvider,
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
    searchParams.set('file_path', activatedPath);
    setSearchParams(searchParams);
  }, [activatedPath]);

  return (
    <Drawer
      width={'75%'}
      open={open}
      onClose={onClose}
      title={`${params.repo} ${getFirstSix(searchParams.get('sha'))} 手工测试 API响应测试`}
    >
      <Spin spinning={loading}>
        <Report value={activatedPath} onSelect={onSelect} dataSource={data} />
      </Spin>
    </Drawer>
  );
};

export default CoverageDetail;
