// import { useQuery } from '@apollo/client';
import { init } from '@canyon/report';
import { useRequest } from 'ahooks';
import axios from 'axios';
import { useEffect, useRef } from 'react';
// import { useParams } from 'react-router';
import { useParams, useSearchParams } from 'react-router-dom';

// import { GetCoverageSummaryMapDocument } from '../../../../helpers/backend/gen/graphql.ts';
import { handleSelectFile } from './helper';
const Sha = () => {
  const prm = useParams();
  const [sprm] = useSearchParams();
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
      }).then(({data}) => data);
    },
    {
      onSuccess(res) {
      },
    },
  );
  const reportRef = useRef(null);
  useEffect(() => {
    if (reportRef.current && data) {
      const report = init(reportRef.current, {
        theme:localStorage.getItem('theme')||'light',
        onSelectFile(path: string) {
          return handleSelectFile({
            filepath: path,
            reportID: sprm.get('report_id') || '',
            sha: prm.sha || '',
            projectID: prm.id || '',
            mode: sprm.get('mode') || '',
          }).then(r=>{
            return r
          });
        },
      });
      const summary = data.reduce((acc: any, cur) => {
        acc[cur.path] = cur;
        return acc;
      }, {});
      report.setOption({ summary: summary });
    }
  }, [data]);

  return (
    <div className='px-6' style={{ minHeight: 'calc(100vh - 96px)' }}>
      <div className={'bg-white'} ref={reportRef} />
    </div>
  );
};

export default Sha;
