import { useRequest } from 'ahooks';
import { Button, Divider, Space } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import CopyCode from '../../../../components/app/CopyCode.tsx';
import { gettingStartedContent } from '../../../../components/app/getting-started-content.ts';

// import CopyCode from '../components/CopyCode.tsx';
// import { gettingStartedContent } from '../components/getting- started-content.ts';
const ProjectGettingStarted = () => {
  const nav = useNavigate();
  const { data } = useRequest(() => axios.get('/api/base').then(({ data }) => data));
  return (
    <div className={'p-[20px] px-6'}>
      <h2 className={'text-3xl'}>Configure Babel</h2>
      <Divider />
      <h4 className={'text-lg'}>Install</h4>
      <p>Add the canyon and istanbul babel plugin as a dependency using npm:</p>
      <CopyCode code={gettingStartedContent.babel} />
      <h4 className={'text-lg'}>Configure Babel</h4>
      <p>Add the following configuration to babel:</p>
      <CopyCode code={gettingStartedContent.webpack} />
      <h4 className={'text-lg'}>Next Steps</h4>
      <Space>
        <Button
          type={'primary'}
          onClick={() => {
            window.open(data?.SYSTEM_QUESTION_LINK);
          }}
        >
          Take me to Report the first coverage
        </Button>
        <Button
          onClick={() => {
            nav(`/projects`);
          }}
        >
          Take me to Projects
        </Button>
      </Space>
    </div>
  );
};

export default ProjectGettingStarted;
