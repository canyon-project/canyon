import Report from 'canyon-report';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const playground = () => {
  const onSelect = () => {
    return new Promise((resolve, reject) => {
      resolve({
        fileContent: '',
        fileCoverage: {},
        fileCodeChange: [],
      });
    });
  };
  return (
    <BasicLayout>
      <Report name={'canyon'} value={''} onSelect={onSelect} dataSource={{}} />
    </BasicLayout>
  );
};

export default playground;
