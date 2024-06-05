import { useRequest } from 'ahooks';
import { Button, ConfigProvider } from 'antd';
import axios from 'axios';
import { CanyonJacocoReport } from 'canyon-ui';
import queryString from 'query-string';
import { useParams, useSearchParams } from 'react-router-dom';

import { handleOnSelect } from './helper/handleOnSelect.ts';

function gen(path, line) {
  return line ? path + '#' + line : path;
}

// http://localhost:8000/jacoco/projects/86085/commits/37582cf3bdb4c8c0eda2fd690c968c02f8ea5ba0?path=path
const ReportPage = ({title}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const { id: projectID, sha } = params;
  // const [path, line] = searchParams.get('path').split('#');

  const loc = useLocation();
  const nav = useNavigate();

  // const path = loc.search

  const path = queryString.parse(loc.search)['path'];
  // console.log(parsed);
  const line = Number(loc.hash.replace('#L', ''));
  const { data: summary } = useRequest(
    () =>
      axios
        .get('/api/coverage/jacoco', {
          params: {
            projectID,
            sha,
            path: path,
          },
        })
        .then(({ data }) => data),
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );

  // TODO: 这里的path会包含#L，需要处理
  const onSelect = (path) => {
    // setSearchParams({
    //   path: path,
    // });

    nav(`/projects/${projectID}/commits/${sha}?path=${path}`);
    // console.log(path);

    console.log(path, 'path');

    return handleOnSelect({ path, projectID, sha });

    //   这里加上promise，返回{coverage,newline,sourcecode}等数据，保证简洁
  };

  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 0,
          },
        }}
      >
        {summary && (
          <CanyonJacocoReport
            title={title}
            summary={summary}
            selectedKey={path}
            selectedLine={line}
            onSelect={onSelect}
          />
        )}
      </ConfigProvider>
    </div>
  );
};

export default ReportPage;