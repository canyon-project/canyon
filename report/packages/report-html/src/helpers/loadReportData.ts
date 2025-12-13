import {base64ToUint8Array, decompressGzip} from "./decompress.ts";

const reportDataBase64 = window.reportData

const decompressedText = await decompressGzip(base64ToUint8Array(reportDataBase64));

window.reportData = JSON.parse(decompressedText)
