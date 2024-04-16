import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

import {
  CheckProjectUrlDocument,
  CreateProjectDocument,
} from '../../../helpers/backend/gen/graphql.ts';

const { Title, Text } = Typography;

const ProjectNew = () => {
  const nav = useNavigate();
  const [createTodo, { data, loading }] = useMutation(CheckProjectUrlDocument);
  const [createProject] = useMutation(CreateProjectDocument);
  return (
    <div className={''}>
      <Title level={2}>Create Project</Title>

      <Title level={4}>Check</Title>
      <Space>
        <Input
          placeholder={
            'please input project gitlab url, e.g. https://gitlab.com/canyon-project/canyon'
          }
          className={'w-[800px] project-url-input'}
        />
        <Button
          onClick={() => {
            createTodo({
              variables: {
                projectUrl: (document.querySelector(`.project-url-input`) as any)?.value,
              },
            });
          }}
        >
          Check
        </Button>
      </Space>
      <div className={'h-[20px]'}></div>
      <Title level={4}>Check Your Project</Title>
      <Spin spinning={loading}>
        <div>
          <Text>projectID:</Text>
          <Text>{data?.checkProjectUrl.id}</Text>
        </div>
        <div>
          <Text>name:</Text>
          <Text>{data?.checkProjectUrl.name}</Text>
        </div>
        <div>
          <Text>path:</Text>
          <Text>{data?.checkProjectUrl.pathWithNamespace}</Text>
        </div>
        <div>
          <Text>description:</Text>
          <Text>{data?.checkProjectUrl.description}</Text>
        </div>
      </Spin>

      <Button
        className={'mt-[20px]'}
        type={'primary'}
        onClick={() => {
          createProject({
            variables: {
              projectID: String(data?.checkProjectUrl.id),
            },
          }).then((res) => {
            message.success(JSON.stringify(res.data?.createProject));
            nav(`/projects/${data?.checkProjectUrl.id}/getting-started`);
          });
        }}
      >
        Create
      </Button>
    </div>
  );
};

export default ProjectNew;
