import { useMutation } from '@apollo/client';
import { Input } from 'antd';
import { FC } from 'react';
import { useParams } from 'react-router-dom';

import { UpdateProjectDocument } from '../../../../../../helpers/backend/gen/graphql.ts';

const { TextArea } = Input;

const BasicForms: FC<{ data: any }> = ({ data }) => {
  const [updateProject] = useMutation(UpdateProjectDocument);
  const prm: any = useParams();
  const { t } = useTranslation();
  const onFinish = (values: any) => {
    updateProject({
      variables: {
        projectID: prm.id,
        coverage: '__null__',
        tag: '__null__',
        description: values.description,
        defaultBranch: '__null__',
      },
    }).then(() => {
      message.success('成功');
    });
  };
  if (data) {
    return (
      <Form
        className={'w-[850px]'}
        name='basic'
        layout={'vertical'}
        initialValues={{
          pathWithNamespace: data.pathWithNamespace,
          description: data.description,
          projectID: data.id,
          tag: data.tag,
          language: data.language,
        }}
        onFinish={onFinish}
      >
        <div className={'flex'}>
          <Form.Item<any>
            label={t('new.repository')}
            name='pathWithNamespace'
            className={'flex-1 mr-10'}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item<any>
            className={'flex-3'}
            label={t('projects.config.project.id')}
            name='projectID'
          >
            <Input disabled />
          </Form.Item>
        </div>

        <Form.Item<any> label={t('common.language')} name='language'>
          <Input disabled />
        </Form.Item>

        <Form.Item<any> label={t('projects.config.project.desc')} name='description'>
          <TextArea autoSize={{ minRows: 3, maxRows: 3 }} />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit'>
            {t('projects.config.save.changes')}
          </Button>
        </Form.Item>
      </Form>
    );
  } else {
    return <div>loading</div>;
  }
};

export default BasicForms;
