import { Result } from 'antd';
import type { FC } from 'react';

const AppResult: FC<{ error: Error | undefined; data: any }> = ({ error, data }) => {
  return (
    <div>
      {error && <Result style={{ padding: '0px' }} status={'error'} title={String(error)} />}
      {data && (
        <Result
          style={{ padding: '0px' }}
          status='success'
          title='Upload Success'
          subTitle={`The report was successfully uploaded,${data.coverageId}, please go to https://canyon.com to view the details of the report.`}
        />
      )}
      {!data && !error && <Result style={{ padding: '0px' }} title='Please upload coverage' />}
    </div>
  );
};
export default AppResult;
