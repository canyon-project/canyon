import { Drawer, Spin } from 'antd';
import Report from 'canyontest-report';
import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import axios from 'axios';
import {useNavigate, useOutletContext, useParams, useSearchParams} from 'react-router-dom';
import { handleSelectFile } from '@/helper';
import { getFirstSix } from '@/helper/getFirstSix.ts';
const FilePath = () => {

  const {repo,commit} = useOutletContext()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  // const params = useParams();


  // const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate();
  const params = useParams();
  function getToFilePath(path) {
    setOpen(false)
    setTimeout(() => {
      navigate(`/${params.provider}/${params.org}/${params.repo}/commits/${commit.sha}${path}?build_provider=${searchParams.get('build_provider')}&build_id=${searchParams.get('build_id')}`)

    },0.5 * 1000);
  }


  const sha = params.sha
  const buildProvider = searchParams.get('build_provider') || 'gitlab_runner';
  const buildID = searchParams.get('build_id') || '';
  const repoID = searchParams.get('repo_id') || repo.id;
  const provider = searchParams.get('provider') || 'gitlab';
  const reportID = searchParams.get('report_id') || '';
  const reportProvider = searchParams.get('report_provider') || '';

  const [activatedPath, setActivatedPath] = useState(params['*']?.replace('-/',''));

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
    if (commit?.sha){
      getToFilePath(`/-/${activatedPath}`)
      setOpen(true)
    }
  }, [activatedPath,commit]);



  const [open,setOpen] = useState(false);



  return (
    <Drawer
      width={'75%'}
      open={open}
      onClose={()=>{
        getToFilePath('')
      }}
      title={`${params.repo} ${getFirstSix(searchParams.get('sha'))} 手工测试 API响应测试`}
    >
      <Spin spinning={loading}>
        <Report value={activatedPath} onSelect={onSelect} dataSource={data} />
      </Spin>
    </Drawer>
  );
};

export default FilePath;
