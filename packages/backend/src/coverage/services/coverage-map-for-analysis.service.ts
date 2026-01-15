import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CoverageAnalysisQueryParamsTypes,
} from '../types/coverage-query-params.types';
import {ConfigService} from "@nestjs/config";
import axios from 'axios';
import { decodeCompressedObject } from '../../collect/helpers/transform';

@Injectable()
export class CoverageMapForAnalysisService {
  constructor(private readonly prisma: PrismaService,    private readonly configService: ConfigService,) {}

  async invoke({
    provider,
    repoID,
    analysisID,
    buildTarget,
    filePath,
    scene,
  }: CoverageAnalysisQueryParamsTypes) {
    // 变量定义
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    const [afterSha, nowSha] = analysisID.split('...');
    // 关键点，对于Analysis来说，必须要通过diff过滤，不然分析数据量太大
    const diffList = await this.prisma.diff.findMany({
      where:{
        from: afterSha,
        to: nowSha,
        provider,
        repo_id: repoID,
      }
    })

    // 构建GitLab Compare API URL
    const url = `${base}/api/v4/projects/${repoID}/repository/compare?from=${afterSha}&to=${nowSha}`;
    const resp = await axios.get(url, {
      headers: {
        'PRIVATE-TOKEN': token,
      },
    }).then(({data})=>data);

    const allCommits = resp.commits.map((commit)=>commit.id).concat([afterSha, nowSha]);

    // 去重复
    const filteredCommits = [
      ...new Set(allCommits)
    ]

    // 准备基准map - 以 nowSha 为基准
    const nowShaIndex = filteredCommits.indexOf(nowSha);
    if (nowShaIndex === -1) {
      return {
        success: false,
        message: 'nowSha not found in filtered commits',
      };
    }

    // 获取 nowSha 的 coverage map
    const nowShaCoverageRecords = await this.prisma.coverage.findMany({
      where: {
        provider,
        repoID,
        sha: nowSha,
        buildTarget,
      },
    });

    if (nowShaCoverageRecords.length === 0) {
      return {
        success: false,
        message: 'No coverage records found for nowSha',
      };
    }

    const nowShaCoverageRecord = nowShaCoverageRecords[0];
    const { instrumentCwd: nowShaInstrumentCwd, buildHash: nowShaBuildHash } = nowShaCoverageRecord;
    const nowShaInstrumentCwdPrefix = nowShaInstrumentCwd + '/';

    // 查询 nowSha 的 mapRelations（只查询 diffList 中的文件）
    const nowShaMapRelations = await this.prisma.coverageMapRelation.findMany({
      where: {
        buildHash: nowShaBuildHash,
        fullFilePath: {
          in: diffList.map(d => nowShaInstrumentCwdPrefix + d.path),
        },
      },
    });

    // 构建 nowSha 的 coverage map 索引
    const nowShaCoverageMapHashKeySet = new Set<string>();
    const nowShaSourceMapHashSet = new Set<string>();
    for (const relation of nowShaMapRelations) {
      nowShaCoverageMapHashKeySet.add(
        `${relation.coverageMapHash}|${relation.fileContentHash}`,
      );
      if (relation.sourceMapHash) {
        nowShaSourceMapHashSet.add(relation.sourceMapHash);
      }
    }

    // 查询 nowSha 的 coverage maps 和 source maps
    const [nowShaCoverageMaps, nowShaSourceMaps] = await Promise.all([
      this.prisma.coverageMap.findMany({
        where: {
          hash: { in: Array.from(nowShaCoverageMapHashKeySet) },
        },
      }),
      this.prisma.coverageSourceMap.findMany({
        where: {
          hash: { in: Array.from(nowShaSourceMapHashSet) },
        },
      }),
    ]);

    // 构建索引
    const nowShaCoverageMapIndex = new Map<string, (typeof nowShaCoverageMaps)[0]>();
    for (const coverageMap of nowShaCoverageMaps) {
      nowShaCoverageMapIndex.set(coverageMap.hash, coverageMap);
    }

    const nowShaSourceMapIndex = new Map<string, (typeof nowShaSourceMaps)[0]>();
    for (const sourceMap of nowShaSourceMaps) {
      nowShaSourceMapIndex.set(sourceMap.hash, sourceMap);
    }

    // 构建 nowSha 的 fileCoverageMap
    const nowShaFileCoverageMap = new Map<string, any>();
    for (const relation of nowShaMapRelations) {
      const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
      const sourceMapRecord = nowShaSourceMapIndex.get(relation.sourceMapHash);
      const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
      const coverageMapRecord = nowShaCoverageMapIndex.get(coverageMapKey);
      if (!coverageMapRecord) continue;

      const decodedCoverageMap = sourceMapRecord
        ? decodeCompressedObject(coverageMapRecord.origin)
        : decodeCompressedObject(coverageMapRecord.restore);

      nowShaFileCoverageMap.set(rawFilePath, {
        path: rawFilePath,
        fileContentHash: relation.fileContentHash,
        ...decodedCoverageMap,
      });
    }

    // 遍历其他 commit，与 nowSha 进行比较
    const comparisonResults: any[] = [];

    for (let i = 0; i < filteredCommits.length; i++) {
      const sha = filteredCommits[i] as string;

      // 跳过 nowSha 自己
      if (sha === nowSha) {
        continue;
      }

      const coverageRecords = await this.prisma.coverage.findMany({
        where: {
          provider,
          repoID,
          sha: sha as string,
          buildTarget,
        },
      });

      if (coverageRecords.length === 0) {
        continue;
      }

      const coverageRecord = coverageRecords[0];
      const { instrumentCwd, buildHash } = coverageRecord;
      const instrumentCwdPrefix = instrumentCwd + '/';

      // 查询该 commit 的 mapRelations（只查询 diffList 中的文件）
      const mapRelations = await this.prisma.coverageMapRelation.findMany({
        where: {
          buildHash,
          fullFilePath: {
            in: diffList.map(d => instrumentCwdPrefix + d.path),
          },
        },
      });

      // 构建该 commit 的 coverage map 索引
      const coverageMapHashKeySet = new Set<string>();
      const sourceMapHashSet = new Set<string>();
      for (const relation of mapRelations) {
        coverageMapHashKeySet.add(
          `${relation.coverageMapHash}|${relation.fileContentHash}`,
        );
        if (relation.sourceMapHash) {
          sourceMapHashSet.add(relation.sourceMapHash);
        }
      }

      // 查询该 commit 的 coverage maps 和 source maps
      const [coverageMaps, sourceMaps] = await Promise.all([
        this.prisma.coverageMap.findMany({
          where: {
            hash: { in: Array.from(coverageMapHashKeySet) },
          },
        }),
        this.prisma.coverageSourceMap.findMany({
          where: {
            hash: { in: Array.from(sourceMapHashSet) },
          },
        }),
      ]);

      // 构建索引
      const coverageMapIndex = new Map<string, (typeof coverageMaps)[0]>();
      for (const coverageMap of coverageMaps) {
        coverageMapIndex.set(coverageMap.hash, coverageMap);
      }

      const sourceMapIndex = new Map<string, (typeof sourceMaps)[0]>();
      for (const sourceMap of sourceMaps) {
        sourceMapIndex.set(sourceMap.hash, sourceMap);
      }

      // 构建该 commit 的 fileCoverageMap
      const fileCoverageMap = new Map<string, any>();
      for (const relation of mapRelations) {
        const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
        const sourceMapRecord = sourceMapIndex.get(relation.sourceMapHash);
        const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
        const coverageMapRecord = coverageMapIndex.get(coverageMapKey);
        if (!coverageMapRecord) continue;

        const decodedCoverageMap = sourceMapRecord
          ? decodeCompressedObject(coverageMapRecord.origin)
          : decodeCompressedObject(coverageMapRecord.restore);
        fileCoverageMap.set(rawFilePath, {
          path: rawFilePath,
          fileContentHash: relation.fileContentHash,
          ...decodedCoverageMap,
        });
      }

      // 与 nowSha 进行比较
      const fileComparisons: any[] = [];

      // 遍历 nowSha 的文件
      for (const [filePath, nowShaFileCoverage] of nowShaFileCoverageMap.entries()) {
        const otherFileCoverage = fileCoverageMap.get(filePath);

        if (!otherFileCoverage) {
          // 该 commit 中没有这个文件
          fileComparisons.push({
            filePath,
            status: 'missing',
            nowShaFileContentHash: nowShaFileCoverage.fileContentHash,
          });
          continue;
        }

        // 比较 fileContentHash
        const fileContentHashEqual = nowShaFileCoverage.fileContentHash === otherFileCoverage.fileContentHash;


        Object.entries(otherFileCoverage.statementMap).forEach((item:any)=>{
          const statementId = item[0];
          const otherStatement = item[1];
          const nowStatement = nowShaFileCoverage.statementMap[statementId];

          // console.log(otherStatement.contentHash===nowStatement.contentHash)
        //   TODO 这里要改成用hash作为key比较，注意多个hash可能对应同一个statementId的情况，这种不要合并
        //   restore貌似不需要了，因为只要有未转换的map就行了，只需要插入的时候获取一次实际路径就行，map只需要存原始的

        })

      }

      comparisonResults.push({
        commitSha: sha,
        fileComparisons,
      });
    }

    return {
      success: true,
      baseCommit: nowSha,
      comparisonResults,
    };
  }
}
