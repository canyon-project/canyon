import libSourceMaps from "istanbul-lib-source-maps";
import libCoverage, {FileCoverageData} from "istanbul-lib-coverage";

export async function remapCoverage(obj:{
  [key: string]: FileCoverageData &{inputSourceMap:object};
}) {
  const res = await libSourceMaps
    .createSourceMapStore()
    .transformCoverage(libCoverage.createCoverageMap(obj));
  const { data: data_1 } = res;
  const obj_1 = {};
  Object.entries(data_1).forEach(([key, value],index) => {
    // @ts-ignore
    const x = value["data"];
    // @ts-ignore
    obj_1[x.path] = {
      ...x,
    };
  });
  return obj_1
}
