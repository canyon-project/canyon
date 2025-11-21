import libCoverage from 'istanbul-lib-coverage';
import libSourceMaps from 'istanbul-lib-source-maps';

export async function remapCoverage(obj: any) {
  const res = await libSourceMaps
    .createSourceMapStore()
    .transformCoverage(libCoverage.createCoverageMap(obj));
  const { data: data_1 } = res;
  const obj_1 = {};
  Object.entries(data_1).forEach(([key, value], index) => {
    // @ts-expect-error
    const x = value['data'];
    // @ts-expect-error
    obj_1[x.path] = {
      ...x,
    };
  });
  return obj_1;
}
