import { Drawer, Spin } from 'antd';
import Report from 'canyontest-report';
import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import axios from 'axios';
import {useNavigate, useOutletContext, useParams} from 'react-router-dom';
import RIf from '@/components/RIf';
import { handleSelectFileBySubject } from '@/helper';

const FilePath = () => {
  const { repo } = useOutletContext<any>();
  const navigate = useNavigate();
  const params = useParams();

  const [activatedPath, setActivatedPath] = useState<string | undefined>(params['*']?.replace('-/',''));
  const [open, setOpen] = useState(false);

  function getToFilePath(path: string) {
    setOpen(false);
    setTimeout(() => {
      navigate(`/${params.provider}/${params.org}/${params.repo}/multiple-commits/${params.shas}${path}`);
    }, 500);
  }

  const shas = (params.shas || '').toString();

  const { data, loading } = useRequest(
    () =>
      axios(`/api/coverage/summary/map`, {
        params: {
          repoID: repo.id,
          provider: 'gitlab',
          subject: 'multiple-commits',
          subjectID: shas,
        },
      }).then(({ data }) => data),
    { refreshDeps: [repo?.id, shas] },
  );

  const onSelect = (val: string) => {
    setActivatedPath(val);
    if (!val.includes('.')) {
      return Promise.resolve({ fileContent: '', fileCoverage: {}, fileCodeChange: [] });
    }
    return handleSelectFileBySubject({
      repoID: repo.id,
      subject: 'multiple-commits',
      subjectID: shas,
      filepath: val,
      provider: 'gitlab',
    }).then((res) => ({
      fileContent: res.fileContent,
      fileCoverage: res.fileCoverage,
      fileCodeChange: res.fileCodeChange,
    }));
  };

  useEffect(() => {
    if (shas) {
      getToFilePath(`/-/${activatedPath || ''}`);
      setOpen(true);
    }
  }, [activatedPath, shas]);

  return (
    <Drawer
      width={'75%'}
      open={open}
      onClose={() => { getToFilePath(''); }}
      title={`${params.repo} Multiple Commits 详情覆盖率`}
    >
      <Spin spinning={loading}>
        <RIf condition={!!data}>
          <Report value={activatedPath} onSelect={onSelect} dataSource={data} />
        </RIf>
      </Spin>
    </Drawer>
  );
};

export default FilePath;


