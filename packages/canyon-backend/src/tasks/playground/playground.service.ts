import { Cron, Timeout } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
// import { deleteSpecificCoverageData } from '../../adapter/coverage-data.adapter';

@Injectable()
export class PlaygroundService {
  constructor(private readonly prisma: PrismaService) {}
  // 每过一天清理一下coverage集合，删除超过3天的normal数据
  // @Timeout(200) // 每天凌晨2点半执行
  async play() {
    const allCovs = await this.prisma.coverage.findMany({
      where: {
        projectID: {
          in: [
            '57543',
            '99316',
            '40301',
            '48604',
            '39665',
            '94022',
            '60266',
            '48991',
            '37248',
            '62612',
            '62760',
            '103830',
            '100807',
            '43046',
            '61889',
            '37674',
            '62940',
          ],
        },
        covType: 'agg',
      },
      select: {
        id: true,
        projectID: true,
        sha: true,
        branch: true,
        // coverage: true,
        instrumentCwd: true,
        covType: true,
        reportID: true,
      },
    });

    for (let i = 0; i < allCovs.length; i++) {
      try {
        console.log(`正在处理第${i + 1}个数据`, allCovs.length);
        const { sha, projectID, branch, reportID, instrumentCwd } = allCovs[i];
        const compareTarget = await axios
          .post(`/getprodsha`, {
            sha: sha,
            projectID: projectID,
          })
          .then((res) => res.data.sha);

        await this.prisma.coverage.create({
          data: {
            sha: sha,
            compareTarget: compareTarget,
            projectID: projectID,
            branch: branch,
            instrumentCwd: instrumentCwd,
            reporter: 8417,
            reportID: reportID,
            covType: 'normal',
            relationID: '65dd4fa4b0c3ba0bd90cc11b',
            consumer: 1,
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
}
