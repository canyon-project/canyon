import Icon from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import { useOutletContext, useParams } from 'react-router-dom';
import { UpdateRepoDocument } from '@/helpers/backend/gen/graphql';
import { SolarUserIdLinear } from '@/pages/[provider]/[org]/[repo]/index/settings/helpers/icons/SolarUserIdLinear.tsx';

const { Title, Text } = Typography;

const RepoSettings = () => {
  const { repo } = useOutletContext<{
    repo: {
      id?: string;
      pathWithNamespace?: string;
      description?: string;
      bu?: string;
    };
  }>();
  const params = useParams();
  const [form] = Form.useForm();

  const repoPath = repo?.pathWithNamespace || `${params.org}/${params.repo}`;
  const repoId = repo?.id || '';
  const bu = repo?.bu || '';

  const [updateRepo, { loading }] = useMutation(UpdateRepoDocument);

  const onFinish = async () => {
    const values = form.getFieldsValue() as {
      bu?: string;
      description?: string;
    };
    try {
      await updateRepo({
        variables: {
          id: repoId,
          bu: values.bu,
          description: values.description,
        },
      });
      message.success('已保存更改');
    } catch (e: unknown) {
      message.error(String(e) || '保存失败');
    }
  };

  return (
    <div className={'px-[20px] py-[12px] space-y-[12px]'}>
      <Card title={'项目设置'}>
        <div className={'space-y-[12px]'}>
          <Title level={5} className={'flex items-center gap-1'}>
            <Icon style={{ fontSize: '20px' }} component={SolarUserIdLinear} />
            基础信息
          </Title>
          <Form
            form={form}
            layout={'vertical'}
            initialValues={{
              repoPath,
              repoId,
              bu,
              description: repo?.description || '',
            }}
            onFinish={onFinish}
          >
            <Form.Item label={'仓库'} name={'repoPath'}>
              <Input disabled />
            </Form.Item>
            <Form.Item label={'项目 ID'} name={'repoId'}>
              <Input disabled />
            </Form.Item>
            <Form.Item label={'Bu'} name={'bu'}>
              <Input placeholder={'请输入 Bu'} />
            </Form.Item>
            <Form.Item label={'描述'} name={'description'}>
              <Input.TextArea rows={4} placeholder={'请输入项目描述'} />
            </Form.Item>

            <Form.Item>
              <Button
                type={'primary'}
                onClick={() => form.submit()}
                loading={loading}
              >
                保存更改
              </Button>
            </Form.Item>
            <Text type={'secondary'}>后续可接入更多字段</Text>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default RepoSettings;
