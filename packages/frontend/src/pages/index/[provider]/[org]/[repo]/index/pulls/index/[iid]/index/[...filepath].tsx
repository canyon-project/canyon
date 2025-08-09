import { Drawer, Spin } from 'antd';
import Report from 'canyontest-report';
import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import axios from 'axios';
import {useNavigate, useOutletContext, useParams, useSearchParams} from 'react-router-dom';
import RIf from '@/components/RIf';
// import { getFirstSix } from '@/helper/getFirstSix';
import { handleSelectFilePull } from '@/helper';

const FilePath = () => {
  const { repo, pull } = useOutletContext<any>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const [activatedPath, setActivatedPath] = useState<string | undefined>(params['*']?.replace('-/',''));
  const [open, setOpen] = useState(false);

  function getToFilePath(path: string) {
    setOpen(false);
    setTimeout(() => {
      navigate(`/${params.provider}/${params.org}/${params.repo}/pulls/${pull.iid}${path}`);
    }, 500);
  }

  // 可选：如果URL中有sha则优先用sha，否则使用pullNumber模式
  const headSha = searchParams.get('sha') || undefined;

  const { data, loading } = useRequest(
    () =>
      axios(`/api/coverage/summary/map/pull`, {
        params: {
          repoID: repo.id,
          provider: 'gitlab',
          pullNumber: pull.iid,
        },
      }).then(({ data }) => data),
    { refreshDeps: [repo?.id, pull?.iid] },
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
    return handleSelectFilePull({
      repoID: repo.id,
      filepath: val,
      pullNumber: pull.iid,
      headSha,
    }).then((res) => {
      return {
        fileContent: res.fileContent,
        fileCoverage: res.fileCoverage,
        fileCodeChange: res.fileCodeChange,
      };
    });
  };

  useEffect(() => {
    if (pull?.iid) {
      getToFilePath(`/-/${activatedPath || ''}`);
      setOpen(true);
    }
  }, [activatedPath, pull?.iid]);

  return (
    <div>
        ssssxxxx
            <Drawer
      width={'75%'}
      open={true}
      onClose={() => {
        getToFilePath('');
      }}
      title={`${params.repo} !${pull?.iid} PR 详情覆盖率`}
    >
      <Spin spinning={loading}>
        <RIf condition={!!data}>
          <Report value={activatedPath} onSelect={onSelect} dataSource={data} />
        </RIf>
      </Spin>
    </Drawer>
        </div>
  );
};

export default FilePath;


