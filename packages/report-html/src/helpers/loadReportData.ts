import {base64ToUint8Array, decompressGzip} from "./decompress.ts";

// 这个里的性能要求非常高，因为是加载全量的覆盖率数据和代码文件源代码内容，所以尽量减少不必要的内存分配和数据复制操作。

const reportDataBase64 = window.reportData
const decompressedText = await decompressGzip(base64ToUint8Array(reportDataBase64));
window.reportData = JSON.parse(decompressedText)
