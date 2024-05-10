import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetProjectsNoDataService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke() {
    const projects = await this.prisma.project.findMany({});
    const noDataProjects = [];
    for (let i = 0; i < projects.length; i++) {
      const coverages = await this.prisma.coverage.findMany({
        where: {
          projectID: projects[i].id,
          covType: {
            in: ['all', 'agg'],
          },
        },
      });
      if (coverages.length === 0) {
        noDataProjects.push(projects[i]);
      }
    }
    return noDataProjects.map((noDataProject) => {
      return {
        ...noDataProject,
        maxCoverage: 0,
        reportTimes: 0,
        lastReportTime: new Date(),
      };
    });
  }
}
