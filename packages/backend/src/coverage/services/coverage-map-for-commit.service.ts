import { Injectable } from '@nestjs/common';
// @ts-expect-error - canyon-map 类型定义可能不完整
import { remapCoverage } from 'canyon-map';
import { decodeCompressedObject } from '../../collect/helpers/transform';
import {
  addMaps,
  ensureNumMap,
  NumMap,
} from '../../helpers/coverage-merge.util';
import { testExclude } from '../../helpers/test-exclude';
import { PrismaService } from '../../prisma/prisma.service';
// import { CoverageQueryParams } from '../../types';
import { extractIstanbulData } from '../helpers/coverage-map-util';
import { CoverageQueryParamsTypes } from '../types/coverage-query-params.types';
import { CoverageMapStoreService } from './coverage.map-store.service';

/*
此服务是基本覆盖率查询服务，保持手作
手作りにこだわる
*/

@Injectable()
export class CoverageMapForCommitService {
  constructor(
    private readonly coverageMapStoreService: CoverageMapStoreService,
    private readonly prisma: PrismaService,
  ) {}
  async invoke({
    provider,
    repoID,
    sha,
    buildTarget,
    reportProvider,
    reportID,
    filePath,
  }: CoverageQueryParamsTypes) {
    const coverageList = await this.prisma.coverage.findMany({
      where: {
        provider,
        repoID,
        sha,
        buildTarget,
      },
    });

    if (coverageList.length === 0) {
      return {};
    }

    const coverage = coverageList[0];
    const { instrumentCwd, buildHash } = coverage;

    // 有了init map方便很多，直接查关系表就行
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          buildHash: buildHash,
          fullFilePath:
            instrumentCwd.replace('/dist/crn/rn_xtaro_ebk_roomInfo', '') +
            '/' +
            filePath,
        },
      });
    // TODO 优化查询逻辑

    const coverageSourceMapList = await this.prisma.coverageSourceMap.findMany({
      where: {
        hash: {
          in: coverageMapRelationList.map((item) => item.sourceMapHash),
        },
      },
    });

    const coverageMapList = await this.prisma.coverageMap.findMany({
      where: {
        hash: {
          in: coverageMapRelationList.map(
            (item) => `${item.coverageMapHash}|${item.fileContentHash}`,
          ),
        },
      },
    });

    const box = {};

    for (const relation of coverageMapRelationList) {
      const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
      const sourceMapItem = coverageSourceMapList.find(
        (item) => item.hash === relation.sourceMapHash,
      );
      const coverageMapItem = coverageMapList.find(
        (item) =>
          item.hash ===
          `${relation.coverageMapHash}|${relation.fileContentHash}`,
      );

      // const inputSourceMap = sourceMapItem ? decodeCompressedObject(sourceMapItem.sourceMap) : null;
      const coverageMap = coverageMapItem?.restore
        ? decodeCompressedObject(coverageMapItem?.restore)
        : decodeCompressedObject(coverageMapItem?.origin);
      box[rawFilePath] = {
        path: rawFilePath,
        ...coverageMap,
        inputSourceMap: sourceMapItem
          ? decodeCompressedObject(sourceMapItem.sourceMap)
          : undefined,
      };
    }

    return {
      // coverageMapRelationList,
      // ss:instrumentCwd+'/'+filePath
      ...box,
      // box,
      // coverageMapRelationList:coverageMapRelationList.length,
      // coverageSourceMapList:coverageSourceMapList.length,
      // coverageMapList:coverageMapList.length,
      // x:coverageMapRelationList.map((item) => item.sourceMapHash)
      // s:coverageMapRelationList.map((item) => item.coverageMapHash)
    };
  }
}
