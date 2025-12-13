import { CanyonReport } from '@canyonjs/report-component'
import {genSummaryMapByCoverageMap} from 'canyon-data'
import {useState} from "react";
import {base64ToUint8Array, decompressGzip} from "./helpers/decompress.ts";

const reportDataBase64 = window.reportData

const decompressedText = await decompressGzip(base64ToUint8Array(reportDataBase64));

function App() {

  const [value,setValue] = useState('')

  const { files: dataSource = [],instrumentCwd } = JSON.parse(decompressedText)

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
      if (val.includes('.')) {
        const file = _dataSource.find(item=>item.path===val);
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
    });
  }

  return (
    <div>
      <CanyonReport name={'All files'} value={value} dataSource={Object.values(dddd)} onSelect={onSelect} />
    </div>
  );
}

export default App;
