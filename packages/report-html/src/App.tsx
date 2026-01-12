import '@canyonjs/report-component/index.css';
import { CanyonReport } from '@canyonjs/report-component';
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { useState } from 'react';

type FileDataResponse = {
  fileCoverage: any;
  fileContent: string;
  fileCodeChange: number[] | { additions: number[]; deletions: number[] };
};

function App() {
  const [value, setValue] = useState('');

  const { files: dataSource = [], instrumentCwd } = window.reportData;

  const _dataSource = dataSource.map((item) => {
    return {
      ...item,
      path: item.path.replace(`${instrumentCwd}/`, ''),
    };
  });

  // 提取有 diff 数据的文件信息
  const diffData = _dataSource
    .filter(
      (item) =>
        item.diff && item.diff.additions && item.diff.additions.length > 0,
    )
    .map((item) => ({
      path: item.path,
      additions: item.diff!.additions,
    }));

  const summaryMapByCoverageMap = genSummaryMapByCoverageMap(
    _dataSource.reduce((acc, cur) => {
      // @ts-expect-error
      acc[cur.path] = cur;
      return acc;
    }, {}),
    diffData,
  );

  function onSelect(val: string): Promise<FileDataResponse> {
    return new Promise((resolve) => {
      setValue(val);
      if (val.includes('.')) {
        const file = _dataSource.find((item) => item.path === val);
        if (file) {
          resolve({
            fileCoverage: file,
            fileContent: file.source,
            fileCodeChange: file.diff || { additions: [], deletions: [] },
          });
        } else {
          resolve({
            fileCoverage: undefined,
            fileContent: '',
            fileCodeChange: { additions: [], deletions: [] },
          });
        }
      } else {
        resolve({
          fileCoverage: undefined,
          fileContent: '',
          fileCodeChange: { additions: [], deletions: [] },
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
        // @ts-expect-error - genSummaryMapByCoverageMap 返回的类型与 DataSourceItem 不完全匹配，但实际使用正常
        dataSource={Object.values(summaryMapByCoverageMap)}
        // @ts-expect-error - FileDataResponse 类型定义已更新但类型系统还未识别
        onSelect={onSelect}
        defaultOnlyChange={true}
      />
    </div>
  );
}

export default App;
