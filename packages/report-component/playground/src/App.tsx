import { genSummaryMapByCoverageMap } from 'canyon-data';
import { useState } from 'react';
import { CanyonReport } from '../../src';

// 扩展 Window 接口
declare global {
  interface Window {
    reportData: {
      files: Array<{
        path: string;
        source: string;
        diff: {
          additions: number[];
          deletions: number[];
        };
      }>;
      instrumentCwd: string;
    };
  }
}

function App() {
  const [value, setValue] = useState(
    'packages/istanbul-lib-source-maps/lib/map-store.js',
  );

  const { files: dataSource = [], instrumentCwd } = window.reportData;

  const _dataSource = dataSource.map((item) => {
    return {
      ...item,
      path: item.path.replace(`${instrumentCwd}/`, ''),
    };
  });

  const summaryMapByCoverageMap = genSummaryMapByCoverageMap(
    _dataSource.reduce((acc, cur) => {
      acc[cur.path] = cur;
      return acc;
    }, {}),
    [
      {
        path: 'packages/istanbul-lib-source-maps/lib/map-store.js',
        additions: [
          1, 10, 11, 12, 13, 20, 30, 31, 32, 33, 50, 60, 70, 80, 90, 100, 110,
          120, 130, 140, 150, 160, 170, 180,
        ],
      },
    ],
  );

  function onSelect(val: string): Promise<any> {
    return new Promise((resolve) => {
      setValue(val);
      const file = _dataSource.find((item) => item.path === val);
      if (file) {
        resolve({
          fileCoverage: file,
          fileContent: file.source,
          fileCodeChange: file.diff,
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
    <div
      style={{
        height: 'calc(100vh - 16px)',
      }}
    >
      <CanyonReport
        name={'All files'}
        value={value}
        dataSource={Object.values(summaryMapByCoverageMap)}
        onSelect={onSelect}
        defaultOnlyChange={true}
      />
    </div>
  );
}

export default App;
