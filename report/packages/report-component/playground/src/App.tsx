import { CanyonReport } from '../../src';
import {genSummaryMapByCoverageMap} from 'canyon-data'
import {useState} from "react";

function App() {

  const [value,setValue] = useState('')

  const { files: dataSource = [],instrumentCwd } = window.reportData;

  const _dataSource = dataSource.map(item=>{
    return {
      ...item,
      path: item.path.replace(instrumentCwd+'/','')
    }
  })

  const dddd = genSummaryMapByCoverageMap(_dataSource.reduce((acc, cur) => {
    acc[cur.path] = cur;
    return acc;
  },{}))


  function onSelect(val) {
    return new Promise((resolve) => {
      setValue(val)
      const file = _dataSource.find(item=>item.path===val);
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
      <CanyonReport name={'All files'} value={value} dataSource={Object.values(dddd)} onSelect={onSelect} />
    </div>
  );
}

export default App;
