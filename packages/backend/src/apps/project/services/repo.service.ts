import { PrismaService } from '../../../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RepoService {
  constructor(private readonly prisma: PrismaService) {}
  async getByRepoId(repoID: string) {
    if (repoID.includes('/')) {
      return this.prisma.project.findFirst({
        where: { pathWithNamespace: repoID },
      });
    } else {
      return this.prisma.project.findFirst({
        where: { id: repoID },
      });
    }
  }

  async getRepoList(page: number, limit: number) {

    const projectList =await this.prisma.project.findMany({
      // skip,
      // take: limit,
      orderBy: { createdAt: 'desc' },
    })

    // 大概也就1W个
    const coverageList = await this.prisma.coverage.findMany({
      where:{
      },
      select:{
        id: true,
        updatedAt: true,
        repoID: true,
      },
      orderBy: { updatedAt: 'desc' },
    })


    const list:any = []

    for (let i = 0; i < projectList.length; i++) {
      const project = projectList[i];
      // const coverage = coverageList;
      const filterCoverageList = coverageList.filter(cover => cover.repoID === project.id);
      list.push({
        ...project,
        reportTimes: filterCoverageList.length,
        lastReportTime: filterCoverageList[0] ? filterCoverageList[0].updatedAt : '1970-01-01T00:00:00.000Z',
      });
    }


    return list.sort((a, b) => {
      return new Date(b.lastReportTime).getTime() - new Date(a.lastReportTime).getTime();
    })
  }
}
