import axios from 'axios';
import * as process from 'process';
import { compressedData, decompressedData } from '../utils/zstd';
import { logger } from '../logger/index';
export function getSpecificCoverageData(coverageDataId: string) {
  return axios
    .get(`${process.env['COVERAGE_DATA_URL']}/coverage-data/${coverageDataId}`)
    .then(({ data }) => decompressedData(data.compresseddata))
    .then((res) => JSON.parse(res))
    .catch((err) => {
      logger({
        type: 'error',
        title: '获取覆盖率数据时出错',
        message: String(err),
      });
      return {};
    });
}

export async function createNewCoverageData(coverageData: any) {
  const compresseddata = await compressedData(JSON.stringify(coverageData));
  return axios
    .post(`${process.env['COVERAGE_DATA_URL']}/coverage-data`, {
      compresseddata: compresseddata,
    })
    .then(({ data }) => data)
    .catch((err) => {
      logger({
        type: 'error',
        title: '创建覆盖率数据时出错',
        message: String(err),
      });
      return {
        insertedId: null,
      };
    });
}

export function deleteSpecificCoverageData(coverageDataId: string) {
  return axios
    .delete(
      `${process.env['COVERAGE_DATA_URL']}/coverage-data/${coverageDataId}`,
    )
    .then(({ data }) => data);
}
