import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CoverageAnalysisQueryParamsTypes,
} from '../types/coverage-query-params.types';
import {ConfigService} from "@nestjs/config";
import axios from 'axios';

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

    // 准备基准map
    const box:any[] = []
    // ***
    for (let i = 0; i < filteredCommits.length; i++) {
      const sha = filteredCommits[i];
      const coverageWhereCondition: any = {
        provider,
        repoID,
        sha,
        buildTarget,
      };

      const coverageRecords = await this.prisma.coverage.findMany({
        where: coverageWhereCondition,
      });

      const coverageRecord = coverageRecords[0];
      const { instrumentCwd, buildHash } = coverageRecord;
      const instrumentCwdPrefix = instrumentCwd + '/';
      // #endregion

      // #region Step 2: 查询覆盖率映射关系
      const mapRelationWhereCondition: {
        buildHash: string;
        fullFilePath?: string;
      } = {
        buildHash,
      };

      // 如果 filePath 存在，则添加 fullFilePath 查询条件
      if (filePath) {
        const fullFilePath = instrumentCwdPrefix + filePath;
        mapRelationWhereCondition.fullFilePath = fullFilePath;
      }

      const mapRelations = await this.prisma.coverageMapRelation.findMany({
        where: {
          fullFilePath:{
            in: diffList.map(d=>instrumentCwdPrefix+d.path)
          }
        },
      });


    }
    return {
      name: 'zt',
      base,
      token,
    };
  }
}
