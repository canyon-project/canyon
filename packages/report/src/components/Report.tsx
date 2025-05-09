import { FC } from 'react';
import { ReportProps } from '../types.ts';
import { Editor } from '@monaco-editor/react';

const ReportComponent: FC<ReportProps> = ({
  theme,
  onSelect,
  value,
  dataSource,
  name,
}) => {
  return (
    <div>
      <Editor
        language={'json'}
        height={'500px'}
        value={JSON.stringify({ name: 'zt' })}
      />
    </div>
  );
};

export default ReportComponent;
