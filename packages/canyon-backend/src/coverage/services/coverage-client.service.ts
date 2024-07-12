import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';

// 先不用消息队列，先用同步的方式，数据采用模拟接口的方式插入

@Injectable()
export class CoverageClientService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(currentUser, coverageClientDto: CoverageClientDto) {
    const { sha, projectID, coverage, reportID, rule, branch } =
      coverageClientDto;
    // 插入reckoning覆盖率数据
    const reckonings = [];

    for (const coverageEntries of Object.entries(coverage)) {
      const [path, fileCoverage]: any = coverageEntries;
      Object.entries(fileCoverage.f).forEach(([k, v]) => {
        reckonings.push({
          dimType: 'f',
          mapIndex: Number(k),
          branchIndex: 0,
          hits: v,
          path: path,
          sha: sha,
          projectID: projectID,
        });
      });
      Object.entries(fileCoverage.s).forEach(([k, v]) => {
        reckonings.push({
          dimType: 's',
          mapIndex: Number(k),
          branchIndex: 0,
          hits: v,
          path: path,
          sha: sha,
          projectID: projectID,
        });
      });
      Object.entries(fileCoverage.b).forEach(([k, v]) => {
        Object.entries(v).forEach(([kk, vv]) => {
          reckonings.push({
            dimType: 'b',
            mapIndex: Number(k),
            branchIndex: Number(kk),
            hits: vv,
            path: path,
            sha: sha,
            projectID: projectID,
          });
        });
      });
    }

    const fileMapTasks = Object.entries(coverage).map(
      async (coverageEntries) => {
        const [path, fileCoverage]: any = coverageEntries;
        await this.prisma.fileMap
          .create({
            data: {
              id: `__${projectID}__${sha}__${path}__`,
              mapJson: JSON.stringify({
                fnMap: fileCoverage.fnMap,
                statementMap: fileCoverage.statementMap,
                branchMap: fileCoverage.branchMap,
              }),
              path: path,
              sha: sha,
              projectID: projectID,
              branch: branch,
            },
          })
          .then((res) => {
            console.log('插入成功');
            return res;
          })
          .catch(() => {
            console.log('已经插入了，这是期望的错误，不用管');
            return true;
          });
      },
    );

    const reckoningsTasks = reckonings.map(async (reckoning) => {
      const { dimType, mapIndex, branchIndex, path, hits } = reckoning;
      const id = `__${projectID}__${sha}__${reportID}__${rule}__${path}__${dimType}__${mapIndex}__${branchIndex}__`;
      const len = await this.prisma.reckoning.findFirst({
        where: {
          id: id,
        },
      });
      if (len) {
        await this.prisma.reckoning.update({
          where: {
            id: id,
          },
          data: {
            // 累加 hits
            hits: {
              increment: hits,
            },
          },
        });
      } else {
        await this.prisma.reckoning.create({
          data: {
            id: id,
            // 覆盖率相关数据
            dimType,
            mapIndex,
            branchIndex,
            hits,
            // 分类聚合的依据，其他什么branch，固定数据都交给fileMap
            reportID,
            rule,
            path,
            sha: sha,
            projectID: projectID,
          },
        });
      }
    });
    const time1 = Date.now();
    await Promise.all(reckoningsTasks);
    console.log('reckoningsTasks', Date.now() - time1);
    const time2 = Date.now();
    await Promise.all(fileMapTasks);
    console.log('fileMapTasks', Date.now() - time2);
    return 'hi';
  }
}
