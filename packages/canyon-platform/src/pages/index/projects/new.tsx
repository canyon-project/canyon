import { useMutation } from '@apollo/client';
import { Button, Input, message, Space, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

import {
  CheckProjectUrlDocument,
  CreateProjectDocument,
} from '../../../helpers/backend/gen/graphql.ts';

// import {
//   CheckProjectUrlDocument,
//   CreateProjectDocument,
// } from '../../helpers/backend/gen/graphql.ts';

const ProjectNew = () => {
  const nav = useNavigate();
  const [createTodo, { data, loading }] = useMutation(CheckProjectUrlDocument);
  const [createProject] = useMutation(CreateProjectDocument);
  return (
    <div className={'px-6'}>
      <h2 className={'text-3xl'}>Create Project</h2>

      <h4 className={'text-lg'}>Check</h4>
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
      <h4 className={'text-lg '}>Check Your Project</h4>
      <Spin spinning={loading}>
        <div>
          <span>projectID:</span>
          <span>{data?.checkProjectUrl.id}</span>
        </div>
        <div>
          <span>name:</span>
          <span>{data?.checkProjectUrl.name}</span>
        </div>
        <div>
          <span>path:</span>
          <span>{data?.checkProjectUrl.pathWithNamespace}</span>
        </div>
        <div>
          <span>description:</span>
          <span>{data?.checkProjectUrl.description}</span>
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
