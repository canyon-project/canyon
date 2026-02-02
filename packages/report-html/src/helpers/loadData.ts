import { base64ToUint8Array, decompressGzip } from './decompress.ts';

// 这个里的性能要求非常高，因为是加载全量的覆盖率数据和代码文件源代码内容，所以尽量减少不必要的内存分配和数据复制操作。

// report-data.js 已经是 JSON 对象，直接使用
const reportData = window.reportData || { files: [] };

// 加载并解压 diff-data.js（如果存在且不为空）
let diffDataFiles: any[] = [];
const diffData = (window as any).diffData;
if (typeof diffData !== 'undefined' && diffData && diffData !== '') {
  try {
    const diffDataBase64 = diffData;
    const decompressedDiffText = await decompressGzip(
      base64ToUint8Array(diffDataBase64),
    );
    const diffDataParsed = JSON.parse(decompressedDiffText);
    diffDataFiles = Array.isArray(diffDataParsed) ? diffDataParsed : diffDataParsed.files || [];
  } catch (error) {
    console.warn('Failed to load or decompress diff-data.js:', error);
  }
}

// 加载并解压 no-diff-data.js（如果存在且不为空）
let noDiffDataFiles: any[] = [];
const noDiffData = (window as any).noDiffData;
if (typeof noDiffData !== 'undefined' && noDiffData && noDiffData !== '') {
  try {
    const noDiffDataBase64 = noDiffData;
    const decompressedNoDiffText = await decompressGzip(
      base64ToUint8Array(noDiffDataBase64),
    );
    const noDiffDataParsed = JSON.parse(decompressedNoDiffText);
    noDiffDataFiles = Array.isArray(noDiffDataParsed) ? noDiffDataParsed : noDiffDataParsed.files || [];
  } catch (error) {
    console.warn('Failed to load or decompress no-diff-data.js:', error);
  }
}

// 合并三个数据源的 files 数组
window.reportData = {
  ...reportData,
  files: [
    ...(reportData.files || []),
    ...diffDataFiles,
    ...noDiffDataFiles,
  ],
};
