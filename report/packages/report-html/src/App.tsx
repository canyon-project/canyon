import { CanyonReport } from '@canyonjs/report-component'
import {genSummaryMapByCoverageMap} from 'canyon-data'
import {useState} from "react";



// base64解码函数
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// gzip解压函数
async function decompressGzip(compressedData) {
  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();

  writer.write(compressedData);
  writer.close();

  const chunks = [];
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      chunks.push(value);
    }
  }

  // 合并所有chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(result);
}

const reportDataBase64 = window.reportData


// 1. base64解码
const compressedBytes = base64ToUint8Array(reportDataBase64);
// 2. gzip解压
const decompressedText = await decompressGzip(compressedBytes);

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
      const file = _dataSource.find(item=>item.path===val);
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
    });
  }

  return (
    <div>
      <CanyonReport name={'All files'} value={value} dataSource={Object.values(dddd)} onSelect={onSelect} />
    </div>
  );
}

export default App;
