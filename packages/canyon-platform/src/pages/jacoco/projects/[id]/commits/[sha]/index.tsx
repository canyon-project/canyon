import { useRequest } from 'ahooks';
import { Button, ConfigProvider } from 'antd';
import axios from 'axios';
import { CanyonJacocoReport } from 'canyon-ui';
import { useParams, useSearchParams } from 'react-router-dom';

import { handleOnSelect } from './helper/handleOnSelect.ts';
// http://localhost:8000/jacoco/projects/86085/commits/37582cf3bdb4c8c0eda2fd690c968c02f8ea5ba0?path=path
const ReportPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const { id: projectID, sha } = params;
  const path = searchParams.get('path');

  const { data: summary } = useRequest(
    () =>
      axios
        .get('/api/coverage/uploadjacoco', {
          params: {
            projectID,
            sha,
            path,
          },
        })
        .then(({ data }) => data),
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );

  const onSelect = (path) => {
    setSearchParams({
      path,
    });

    return handleOnSelect({ path, projectID, sha });

    //   这里加上promise，返回{coverage,newline,sourcecode}等数据，保证简洁
  };

  return (
    <div className={'p-[20px]'} style={{ backgroundColor: 'rgb(251,252,253)' }}>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 0,
          },
        }}
      >
        {summary && <CanyonJacocoReport summary={summary} selectedKey={path} onSelect={onSelect} />}
      </ConfigProvider>
    </div>
  );
};

export default ReportPage;
