import {Drawer, Spin} from 'antd';
import Report from 'canyon-report';
import {useEffect, useState} from 'react';
import {useRequest} from 'ahooks';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import RIf from '@/components/RIf';
// import {handleSelectFileBySubject} from '@/helper';
function handleSelectFileBySubject() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fileContent: '',
        fileCoverage: {},
        fileCodeChange: '',
      });
    }, 0);
  });
}

type SubjectType = 'commit' | 'commits' | 'pull' | 'pulls' | 'multiple-commits' | 'multi-commits';

interface CoverageFileDrawerProps {
  repo: any;
  subject: SubjectType;
  subjectID: string;
  basePath: string; // e.g. /:provider/:org/:repo/commits/:sha
  initialPath?: string; // file path without /-/ prefix
  provider?: string;
  title?: string;
}

const CoverageFileDrawer = ({
  repo,
  subject,
  subjectID,
  basePath,
  initialPath,
  provider = 'gitlab',
  title = 'Coverage Detail',
}: CoverageFileDrawerProps) => {
  const navigate = useNavigate();

  const [activatedPath, setActivatedPath] = useState<string | undefined>(initialPath);
  const [open, setOpen] = useState(false);

  const getToFilePath = (path: string) => {
    setOpen(false);
    setTimeout(() => {
      // 确保 path 片段在查询参数之前：/base/-/file?query
      const qIndex = basePath.indexOf('?');
      if (qIndex >= 0) {
        const prefix = basePath.slice(0, qIndex);
        const qs = basePath.slice(qIndex + 1);
        navigate(`${prefix}${path}?${qs}`);
      } else {
        navigate(`${basePath}${path}`);
      }
    }, 500);
  };

  const { data, loading } = useRequest(
    () => axios(`/api/coverage/summary/map`, {
      params: { repoID: repo.id, provider, subject, subjectID },
    }).then(({data}) => data),
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
      subjectID,
      filepath: val,
      provider,
    }).then((res) => ({
      fileContent: res.fileContent,
      fileCoverage: res.fileCoverage,
      fileCodeChange: res.fileCodeChange,
    }));
  };

  useEffect(() => {
    if (subjectID) {
      getToFilePath(`/-/${activatedPath || ''}`);
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatedPath, subjectID]);

  return (
    <Drawer
      width={'75%'}
      open={open}
      onClose={() => { getToFilePath(''); }}
      title={<div>
        {title}
        <a href={`/report/-${window.location.href.replace(window.location.origin, '')}`} target="_blank">在新窗口打开</a>
      </div>}
    >
      <Spin spinning={loading}>
        <RIf condition={!!data}>
          <Report value={activatedPath} onSelect={onSelect} dataSource={data} />
        </RIf>
      </Spin>
    </Drawer>
  );
};

export default CoverageFileDrawer;


