import { Card, Descriptions } from 'antd';
import { useOutletContext, useParams } from 'react-router-dom';

const RepoSettings = () => {
  const { repo } = useOutletContext<{
    repo: { id?: string; pathWithNamespace?: string };
  }>();
  const params = useParams();

  return (
    <div className={'px-[20px] py-[12px] space-y-[12px]'}>
      <Card title={'项目设置'}>
        <Descriptions column={1} size='small'>
          <Descriptions.Item label={'仓库'}>
            {repo?.pathWithNamespace || `${params.org}/${params.repo}`}
          </Descriptions.Item>
          <Descriptions.Item label={'Provider'}>
            {params.provider}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default RepoSettings;
