import { compress, decompress } from "@mongodb-js/zstd";
import {CoverageMapData} from "istanbul-lib-coverage";
import * as protobuf from "protobufjs";

function formatCoverageDataToProto(coverageData) {
  // @ts-ignore
  return Object.fromEntries(Object.entries(coverageData).map(([key, value]) => [
    key,
    {
      // @ts-ignore
      ...value,
      // @ts-ignore
      b: Object.fromEntries(Object.entries(value.b).map(([k, v]) => [k, { data: v }]))
    }
  ]));
}

function deFormatCoverageDataToProto(deCoverageData) {
  // @ts-ignore
  return Object.fromEntries(Object.entries(deCoverageData).map(([key, value]) => [
    key,
    {
      // @ts-ignore
      ...value,
      // @ts-ignore
      b: Object.fromEntries(Object.entries(value.b).map(([k, v]) => [k, v.data]))
    }
  ]));
}

export async function compressCoverageData(coverageData) {
  return new Promise((resolve, reject) => {
    protobuf.load("proto/coverage.proto", function(err, root) {
      if (err)
        throw err;
      // Obtain a message type
      const CoverageDataMessage = root.lookupType("CoverageData");

      // Exemplary payload
      const payload = {
        data: formatCoverageDataToProto(coverageData)
      }



      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      const errMsg = CoverageDataMessage.verify(payload);
      if (errMsg)
        throw Error(errMsg);

      // Create a new message
      const message = CoverageDataMessage.create(payload); // or use .fromObject if conversion is necessary

      // Encode a message to an Uint8Array (browser) or Buffer (node)
      const time = new Date().getTime()

      // +++ 压缩开始 +++

      // 经过protobuf编码后的buffer
      const protobufBuffer = CoverageDataMessage.encode(message).finish();

      // 再经过zstd压缩后的buffer
      // @ts-ignore
      compress(protobufBuffer).then((zstdBuffer) => {

        // +++ 压缩结束 +++
        const encoder = new TextEncoder();
        const encoded = encoder.encode(JSON.stringify(coverageData));
        const byteLength = encoded.length;
        console.log(`zstd+protobuf压缩，压缩耗时: ${new Date().getTime() - time} ms`)
        console.log(`zstd+protobuf压缩，压缩前大小：${byteLength}b，压缩后大小：${Buffer.byteLength(zstdBuffer)}b`)
        console.log(`zstd+protobuf压缩，压缩率：${(100*(byteLength - Buffer.byteLength(zstdBuffer)) / byteLength).toFixed(2)}%`)
        resolve(zstdBuffer);
      });
    });
  });
}

export async function decompressCoverageData(buffer) {
  return new Promise((resolve, reject) => {
    decompress(buffer).then((res) => {
      protobuf.load("proto/coverage.proto", function(err, root) {
          if (err)
            throw err;
          // Obtain a message type
          const CoverageDataMessage = root.lookupType("CoverageData");
          var message = CoverageDataMessage.decode(res);
          // Maybe convert the message back to a plain object
          var object = CoverageDataMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
            // see ConversionOptions
          });
          resolve(deFormatCoverageDataToProto(object.data));
        }
      )
    })
  });
}


export async function compressCoverageDataByZstd(str) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  const byteLength = encoded.length;
  const time = new Date().getTime()

  // +++压缩开始+++
  const buffer = Buffer.from(str);
  const compressed = await compress(buffer,22);
  // +++压缩结束+++

  console.log(`zstd直接压缩，压缩等级：${22}`)
  console.log(`zstd直接压缩，压缩耗时: ${new Date().getTime() - time}ms`)
  console.log(`zstd直接压缩，压缩前大小：${str.length}b，压缩后大小：${Buffer.byteLength(compressed)}b`)
  console.log(`zstd直接压缩，压缩率：${(100*(byteLength-Buffer.byteLength(compressed)) / byteLength).toFixed(2)}%`)
  return compressed
}

export async function decompressCoverageDataByZstd(buffer) {
  const decompressed = await decompress(buffer);
  return decompressed
}
