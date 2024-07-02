import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CoverageSummary } from '../models/coverage-summary';
import { genSummaryMapByCoverageMap } from '@canyon/data';
import { CoverageDataAdapterService } from './common/coverage-data-adapter.service';
import { TestExcludeService } from './common/test-exclude.service';
import * as dayjs from "dayjs";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
@Injectable()
export class CoverageReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageDataAdapterService: CoverageDataAdapterService,
    private readonly testExcludeService: TestExcludeService,
  ) {}

  async invoke(
    {bu,start,end}
  ) {
    const projects = await this.prisma.project.findMany({
      where:{
        bu:bu,
        pathWithNamespace:{
          not:{
            contains:'canyon'
          }
        }
      },
      select:{
        id:true,
        name:true,
        pathWithNamespace:true,
        description:true
      }
    })
    // await sleep(1000)
    const covs =await this.prisma.coverage.findMany({
      where:{
        covType:'all',
        projectID:{
          in:projects.map(item => item.id)
        },
        // updatedAt:{}
        // 根据updatedAt的一个范围
        updatedAt:{
          gte: dayjs(start).toDate(),
          lte: dayjs(end).toDate()
        }
      }
    })
    const obj = {}
    for (let i = 0; i < covs.length; i++) {
      const projectID = `${covs[i].projectID.split('-')[1]}-${covs[i].projectID.includes('-ut')?'ut':'auto'}`
      if (obj[projectID] === undefined) {
        obj[projectID] = {
          maxCoverage:covs[i].summary['statements']['pct'],
          projectID:covs[i].projectID.split('-')[1]
        }
      } else {
        obj[projectID].maxCoverage = Math.max(obj[projectID].maxCoverage, covs[i].summary['statements']['pct'])
      }
    }
    const rows = []
    Object.keys(obj).forEach(key => {
      const index = rows.findIndex(item => item.projectID === obj[key].projectID)
      if (index>-1){
        rows[index][key.includes('-ut')?'ut':'auto']=obj[key].maxCoverage
      } else {
        rows.push({
          projectID:obj[key].projectID,
          ut:key.includes('-ut')?obj[key].maxCoverage:0,
          auto:key.includes('-auto')?obj[key].maxCoverage:0,
        })
      }
    })

    for (let i = 0; i < rows.length; i++) {
      const project = projects.find(item => item.id.includes(rows[i].projectID))
      // rows[i].name = project.name
      rows[i].pathWithNamespace = project.pathWithNamespace
      rows[i].description = project.description
    }
    return rows.sort((a,b)=>a.auto-b.auto)
  }
}
