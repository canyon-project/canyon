import { ArrowRightOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';

import { UpdateProjectDocument } from '../../../../../../helpers/backend/gen/graphql.ts';

const { TextArea } = Input;

const { Text } = Typography;

const { CheckableTag } = Tag;

const tagsData = ['V2Vi', 'Q1JO', 'VHJpcC5jb20=', 'Q3RyaXA=', 'RkxJR0hU', 'Q09SUA=='].map(atob);

const colors = ['#4FA15B', '#087EA4', '#287DFA', '#FFB400', '#981d97', '#0B52D1'];

// value, onChange提供给antd的Form使用
const TagComponent: FC<{ value?: string; onChange?: (value: string) => void }> = ({
  value,
  onChange = () => {},
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(value ? value.split(',') : []);
  const handleChange = (tag: string, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    setSelectedTags(nextSelectedTags);

    onChange(nextSelectedTags.join(','));
  };

  return (
    <>
      <Space size={[0, 8]} wrap>
        {tagsData.map((tag) => (
          <CheckableTag
            key={tag}
            checked={selectedTags.includes(tag)}
            onChange={(checked) => handleChange(tag, checked)}
          >
            {tag}
          </CheckableTag>
        ))}
      </Space>
      <div className={'inline-block'}>
        <ArrowRightOutlined className={'mr-2'} />
        {selectedTags.map((tag) => (
          <Tag
            key={tag}
            color={tagsData.indexOf(tag) > -1 ? colors[tagsData.indexOf(tag)] : '#108ee9'}
          >
            {tag}
          </Tag>
        ))}
        {selectedTags.length === 0 && (
          <Text className={'text-xs'} type={'secondary'}>
            请选择标签
          </Text>
        )}
      </div>
    </>
  );
};

const BasicForms: FC<{ data: any }> = ({ data }) => {
  const [updateProject] = useMutation(UpdateProjectDocument);
  const prm: any = useParams();
  const onFinish = (values: any) => {
    updateProject({
      variables: {
        projectID: prm.id,
        coverage: '__null__',
        tag: values.tag,
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
        }}
        onFinish={onFinish}
      >
        <div className={'flex'}>
          <Form.Item<any> label='项目名称' name='pathWithNamespace' className={'flex-1 mr-10'}>
            <Input disabled />
          </Form.Item>

          <Form.Item<any> className={'flex-3'} label='项目ID' name='projectID'>
            <Input disabled />
          </Form.Item>
        </div>

        <Form.Item<any> label='描述' name='description'>
          <TextArea autoSize={{ minRows: 3, maxRows: 3 }} />
        </Form.Item>

        <Form.Item<any> label='标签' name='tag'>
          <TagComponent />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit'>
            保存更改
          </Button>
        </Form.Item>
      </Form>
    );
  } else {
    return <div>加载中</div>;
  }
};

export default BasicForms;
