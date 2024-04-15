// import { useQuery } from '@apollo/client';
import { init } from '@canyon/report';
import { useRequest } from 'ahooks';
import axios from 'axios';
import { useEffect, useRef } from 'react';
// import { useParams } from 'react-router';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

// import { GetCoverageSummaryMapDocument } from '../../../../helpers/backend/gen/graphql.ts';
import { handleSelectFile } from './helper';
const Sha = () => {
  const prm = useParams();
  const nav = useNavigate();
  const [sprm] = useSearchParams();
  // 在组件中
  const location = useLocation();
  const currentPathname = location.pathname;

  // const { data } = useQuery(GetCoverageSummaryMapDocument, {
  //   variables: {
  //     reportID: sprm.get('report_id') || '',
  //     commitSha: prm.sha || '',
  //     mode: sprm.get('mode') || '',
  //   },
  // });
  const { data } = useRequest(
    () => {
      return axios({
        url: '/api/coverage/summary/map',
        method: 'GET',
        params: {
          reportID: sprm.get('report_id') || '',
          sha: prm.sha || '',
          mode: sprm.get('mode') || '',
        },
      }).then(({ data }) => data);
    },
    {
      onSuccess() {},
    },
  );
  const reportRef = useRef(null);
  useEffect(() => {
    if (reportRef.current && data) {
      const report = init(reportRef.current, {
        defaultPath: sprm.get('path') || '~',
        theme: localStorage.getItem('theme') || 'light',
        onSelectFile(path: string) {
          // console.log(path)

          // 假设你想要导航到 '/path' 并且拼接参数
          // const path1 = `/path`;
          const params = new URLSearchParams();
          if (sprm.get('report_id')) {
            params.append('report_id', sprm.get('report_id') || '');
          }
          if (sprm.get('mode')) {
            params.append('mode', sprm.get('mode') || '');
          }

          // params.append('mode', sprm.get('mode'));
          params.append('path', path);

          // 将参数拼接到路径中
          const pathWithParams = `${currentPathname}?${params.toString()}`;

          nav(pathWithParams);
          if (path.includes('.')) {
            return handleSelectFile({
              filepath: path,
              reportID: sprm.get('report_id') || '',
              sha: prm.sha || '',
              projectID: prm.id || '',
              mode: sprm.get('mode') || '',
            }).then((r) => {
              return r;
            });
          } else {
            return new Promise((resolve) => {
              resolve({} as any);
            });
            // return new P
          }
        },
      });
      const summary = data.reduce((acc: any, cur: any) => {
        acc[cur.path] = cur;
        return acc;
      }, {});
      report.setOption({ summary: summary });
    }
  }, [data]);

  return (
    <div
      className='p-2 rounded-md bg-white dark:bg-[#151718]'
      style={{ minHeight: 'calc(100vh - 96px)' }}
    >
      <div className={'bg-white'} ref={reportRef} />
    </div>
  );
};

export default Sha;
