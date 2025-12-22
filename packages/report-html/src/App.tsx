import '@canyonjs/report-component/index.css';
import { CanyonReport } from '@canyonjs/report-component';
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { useState } from 'react';

function App() {
  const [value, setValue] = useState('');

  const { files: dataSource = [], instrumentCwd } = window.reportData;

  const _dataSource = dataSource.map((item) => {
    return {
      ...item,
      path: item.path.replace(`${instrumentCwd}/`, ''),
    };
  });

  const summaryMapByCoverageMap = genSummaryMapByCoverageMap(
    _dataSource.reduce((acc, cur) => {
      // @ts-expect-error
      acc[cur.path] = cur;
      return acc;
    }, {}),
  );

  function onSelect(val: string) {
    return new Promise((resolve) => {
      setValue(val);
      if (val.includes('.')) {
        const file = _dataSource.find((item) => item.path === val);
        if (file) {
          resolve({
            fileCoverage: file,
            fileContent: file.source,
            fileCodeChange: file.changedLines,
          });
        } else {
          resolve({
            fileCoverage: undefined,
            fileContent: '',
            fileCodeChange: [],
          });
        }
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
      {/*// @ts-ignore*/}
      <CanyonReport
        name={'All files'}
        value={value}
        dataSource={Object.values(summaryMapByCoverageMap)}
        onSelect={onSelect}
      />
    </div>
  );
}

export default App;
