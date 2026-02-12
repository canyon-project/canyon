import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {CoverageMapForCommitService} from "./coverage-map-for-commit.service";

/*

覆盖率数据上报的时候用上游的变量
接下来就是查cr表，根据仓库查到fork的上游repoID，然后查coverage表，查diff表，服用commit接口
*/

@Injectable()
export class CoverageMapForCrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageMapForCommitService: CoverageMapForCommitService
  ) {}

  async invoke(p) {
    const crList = await this.prisma.cr.findMany({
      where: {
        id: `${p.provider}-${p.repoID}-${p.crID}`,
      },
    });
    const len = crList.length;
    if (!(len > 0)) {
      return {
        msg: '没找到',
      };
    }

    const cr = crList[0];

    // p.crID




    // @ts-ignore
    const baseRepoID = String(cr?.content?.pull_request?.base?.repo?.id||'');
    // @ts-ignore
    const baseSha = String(cr?.content?.pull_request?.base?.sha||'');
    // @ts-ignore
    const headRepoID = String(cr?.content?.pull_request?.head?.repo?.id||'');
    // @ts-ignore
    const headSha = String(cr?.content?.pull_request?.head?.sha||'');


    const r = await this.prisma.diff.findMany({
      where:{
        subject:'pr',
        subjectID: p.crID,
        repoID:headRepoID,
        provider: p.provider,
      }
    })


    const coverage= await this.coverageMapForCommitService.invoke({
      provider: p.provider,
      repoID: headRepoID,
      sha: headSha,
      buildTarget: p.buildTarget || '',
      filePath: p.filePath,
      scene: p.scene||{}, // 新增字段，起筛选作用
    })

    const cov = {}

    for (const k in coverage) {
      const item = coverage[k];
      // @ts-ignore
      const diffItem = r.find(i=>{
        // @ts-ignore
        return i.path===item.path
      })
      if (diffItem){
        cov[k]={
          // @ts-ignore
          ...item,
          diff: {
            additions: diffItem.additions || [],
            deletions: diffItem.deletions || [],
          },
        }
      }
    }

    return  {
      success: true,
      coverage: cov,
    }
  }
}
