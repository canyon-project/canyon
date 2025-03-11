import PipelineCoverageDetails from '@/components/pipeline-coverage-details.tsx';
import { ConfigProvider } from 'antd';

const CommitsDetail = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: '0',
        },
      }}
    >
      <PipelineCoverageDetails />
    </ConfigProvider>
  );
};

export default CommitsDetail;
