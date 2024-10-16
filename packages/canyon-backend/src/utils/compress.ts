import { compress, decompress } from "@mongodb-js/zstd";
import {CoverageMapData} from "istanbul-lib-coverage";
import * as protobuf from "protobufjs";

function jianchaJiaZhuanhuan(coverageData) {
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

function fan_jianchaJiaZhuanhuan(fan_coverageData) {
  // console.log(fan_coverageData,'fan_coverageData')
  // @ts-ignore
  return Object.fromEntries(Object.entries(fan_coverageData).map(([key, value]) => [
    key,
    {
      // @ts-ignore
      ...value,
      // @ts-ignore
      b: Object.fromEntries(Object.entries(value.b).map(([k, v]) => [k, v.data]))
    }
  ]));
}

export async function compressCoverageData(coverageData: CoverageMapData) {
  const time = new Date().getTime()
  return new Promise((resolve, reject) => {
    // 获取根目录下的coverage.proto文件
    protobuf.load("proto/coverage.proto", function(err, root) {
      if (err)
        throw err;

      // Obtain a message type
      const AwesomeMessage = root.lookupType("CoverageData");

      // Exemplary payload
      const payload = {
        data: jianchaJiaZhuanhuan(coverageData)
      }

      // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
      const errMsg = AwesomeMessage.verify(payload);
      if (errMsg)
        throw Error(errMsg);

      // Create a new message
      const message = AwesomeMessage.create(payload); // or use .fromObject if conversion is necessary

      // Encode a message to an Uint8Array (browser) or Buffer (node)
      const buffer2 = AwesomeMessage.encode(message).finish();
      // ... do something with buffer

      // resolve(buffer);

      // console.log(buffer2)
      // @ts-ignore
      // const res = compress(buffer2);
      compress(buffer2).then((res) => {
        // console.log(new Date().getTime() - time, 'compress time')
        console.log(`压缩耗时: ${new Date().getTime() - time} ms`)
        // 压缩率
        console.log(`${JSON.stringify(coverageData).length} b`, `${res.length} b`, (100*res.length / JSON.stringify(coverageData).length).toFixed(2)+'%')
        resolve(res);
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
          const AwesomeMessage = root.lookupType("CoverageData");



          var message = AwesomeMessage.decode(res);
          // ... do something with message

          // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

          // Maybe convert the message back to a plain object
          var object = AwesomeMessage.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
            // see ConversionOptions
          });


          resolve(fan_jianchaJiaZhuanhuan(object.data));

        }
      )
    })
  });
}
