import { useRequest } from 'ahooks';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import CopyCode from '../../../../components/app/CopyCode.tsx';
import { gettingStartedContent } from '../../../../components/app/getting-started-content.ts';
const { Title, Text } = Typography;
// import CopyCode from '../components/CopyCode.tsx';
// import { gettingStartedContent } from '../components/getting- started-content.ts';
const ProjectGettingStarted = () => {
  const nav = useNavigate();
  const { data } = useRequest(() => axios.get('/api/base').then(({ data }) => data));
  return (
    <div className={''}>
      <Title level={2}>Configure Babel</Title>
      <Divider />
      <Title level={4}>Install</Title>
      <Text>Add the canyon and istanbul babel plugin as a dependency using npm:</Text>
      <CopyCode code={gettingStartedContent.babel} />
      <Title level={4}>Configure Babel</Title>
      <Text>Add the following configuration to babel:</Text>
      <CopyCode code={gettingStartedContent.webpack} />
      <Title level={4}>Next Steps</Title>
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
