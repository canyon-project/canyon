import { genSummaryMapByCoverageMap } from 'canyon-data';
import { useState } from 'react';
import { CanyonReport, type FileDataResponse } from '../../src';

// 扩展 Window 接口
declare global {
  interface Window {
    reportData: {
      files: Array<{
        path: string;
        source: string;
        [key: string]: any;
      }>;
      instrumentCwd: string;
    };
  }
}

function App() {
  const [value, setValue] = useState('');

  const { files: dataSource = [], instrumentCwd } = window.reportData;

  const _dataSource = dataSource.map((item: any) => {
    return {
      ...item,
      path: item.path.replace(`${instrumentCwd}/`, ''),
    };
  });

  const dddd = genSummaryMapByCoverageMap(
    _dataSource.reduce((acc: any, cur: any) => {
      acc[cur.path] = cur;
      return acc;
    }, {}),
  );

  function onSelect(val: string): Promise<FileDataResponse> {
    return new Promise((resolve) => {
      setValue(val);
      const file = _dataSource.find((item: any) => item.path === val);
      if (file) {
        resolve({
          fileCoverage: file,
          fileContent: file.source,
          fileCodeChange: [],
        });
      } else {
        resolve({
          fileCoverage: undefined,
          fileContent: '',
          fileCodeChange: [],
        });
      }
    });
  }

  return (
    <div>
      <CanyonReport
        name={'All files'}
        value={value}
        dataSource={Object.values(dddd)}
        onSelect={onSelect}
      />
    </div>
  );
}

export default App;
