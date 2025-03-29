import { Injectable } from '@nestjs/common';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  mergeCoverageMap, reorganizeCompleteCoverageObjects,
} from 'canyon-data';

import { CoveragediskService } from './coveragedisk.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { compressedData, decompressedData } from '../common/compress';
import { coverageObj } from '../../models/coverage.model';

// import { IstanbulHitMapSchema } from '../../../../zod/istanbul.zod';
// import { logger } from '../../../../logger';
// import { PullChangeCodeAndInsertDbService } from '../common/pull-change-code-and-insert-db.service';
import {summaryToDbSummary} from "../../../../utils/utils";
import {testExclude} from "../common/test-exclude";
// import { CoverageFinalService } from '../common/coverage-final.service';
// import { summaryToDbSummary } from '../../../../utils/utils';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
覆盖率数据消费
- 轮询本地sqlite数据库
- 查找相同sha和projectID的覆盖率数据，判断锁是否被占用，占用的话要还回去
 */
@Injectable()
export class ConsumerCoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coveragediskService: CoveragediskService,
    // private readonly pullChangeCodeAndInsertDbService: PullChangeCodeAndInsertDbService,
    // private readonly coverageFinalService: CoverageFinalService,
  ) {}

  async invoke() {
    console.log('ConsumerCoverageService start!!!');
    while (true) {
      try {
        // 获取将要消费的队列数据，sha和projectID相同，并且已经聚合
        const queueDataToBeConsumed =
          await this.coveragediskService.getQueueWithSameShaAndProjectID();
        // 如果存在
        if (queueDataToBeConsumed) {
          const _lockName = 'consumer_coverage';
          const lockName = `${_lockName}_${queueDataToBeConsumed.buildID}_${queueDataToBeConsumed.projectID}_${queueDataToBeConsumed.sha}`;

          const lockAcquired = await this.acquireLock(lockName, 1000 * 60 * 2);

          if (lockAcquired) {
            const dataFormatAndCheckQueueDataToBeConsumed =
              queueDataToBeConsumed;
            try {

              // REPORT_ID 单个reportID

              // REPORT_PROVIDER // 手工or手工

              // BUILD_ID 流水线层面的


              await this.consume(
                dataFormatAndCheckQueueDataToBeConsumed,
                'REPORT_ID',
              );
              await this.consume(
                dataFormatAndCheckQueueDataToBeConsumed,
                'REPORT_PROVIDER',
              );
              await this.consume(
                dataFormatAndCheckQueueDataToBeConsumed,
                'BUILD_ID',
              );
              // 执行任务
            } finally {
              await this.releaseLock(lockName);
            }
          } else {
            await this.coveragediskService.pushQueue(queueDataToBeConsumed);
            await sleep(1000 * 10);
            // 锁已被其他实例持有，无法获取锁
          }
        } else {
          // 空闲等待1s，防止cpu占用过高
          await sleep(1000 * 10);
        }
      } catch (e) {
        console.log(e);
        await sleep(1000 * 10);
      }
    }
  }
  async consume(queueDataToBeConsumed, covType) {

    const scopes = await this.prisma.project.findFirst({
      where:{
        id:queueDataToBeConsumed.projectID
      }
    }).then(r=>Array(r?.scopes||[]))

    for (let i = 0; i < scopes.length; i++) {
      const scope = scopes[i];







      // 读取agg类型的数据

      const reporterConfig = [{
        type: 'REPORT_PROVIDER_AUTO',
        value:'flytest'
      }]

      const coverage = await this.prisma.coverage.findFirst({
        where: {
          sha: queueDataToBeConsumed.sha,
          projectID: queueDataToBeConsumed.projectID,
          covType: covType==='REPORT_PROVIDER'?reporterConfig.find(item=>item.value ===queueDataToBeConsumed.reportProvider)?.type:covType,// covType是REPORT_PROVIDER的时候要分是手工还是自动化REPORT_PROVIDER_AUTO、REPORT_PROVIDER_MUT
          reportID:
            covType === 'REPORT_ID' ? queueDataToBeConsumed.reportID : undefined,
        },
      });

      // 关键节点，合并过后的数据，这里的合并并不需要map数据参与，也不一定，因为sourceMap的存在

      const mergedHit = mergeCoverageMap(
        queueDataToBeConsumed.coverage,
        // @ts-ignore
        await decompressedData(coverage?.hit), //未删除插桩路径的
      );


      //
      // @ts-ignore
      const mergedCoverageObj = await this.gen({sha:coverage.sha,repoID:coverage.projectID},mergedHit);

      const summary = genSummaryMapByCoverageMap(
        testExclude(scope,mergedCoverageObj),
        [],
      );
      const sum: any = getSummaryByPath('', summary);
      const summaryZstd = await compressedData(summary);

      // 实际存储不能用全量数据，大10倍，非常重要，只留下bfs的数据，体积小10倍，是reMap的
      const compressedHit = await compressedData(mergedHit);
      if (coverage) {
        await this.prisma.coverage.update({
          where: {
            id: coverage.id,
          },
          data: {
            hit: compressedHit,
            ...summaryToDbSummary(sum),
            summary: summaryZstd,
            // TODO 暂时
            updatedAt: new Date(),
            compareTarget: queueDataToBeConsumed.compareTarget,
            buildID: queueDataToBeConsumed.buildID,
            buildProvider: queueDataToBeConsumed.buildProvider,
          },
        }); // 更新时间
      } else {
        // 创建新的agg
        await this.prisma.coverage.create({
          data: {
            ...coverageObj,
            hit: compressedHit,
            covType: covType,
            ...summaryToDbSummary(sum),
            summary: summaryZstd,
            sha: queueDataToBeConsumed.sha,
            projectID: queueDataToBeConsumed.projectID,
            reporter: String(queueDataToBeConsumed.reporter),
            reportID: queueDataToBeConsumed.reportID,
            buildID: queueDataToBeConsumed.buildID,
            buildProvider: queueDataToBeConsumed.buildProvider,
            reportProvider: String(queueDataToBeConsumed.reportProvider),
            scopeID: queueDataToBeConsumed.scopeID,
          },
        });
      }


    }

  }

  async gen({repoID,sha},hit) {
    const coverageMaps = await this.prisma.coverageMap.findMany({
      where:{
        provider:'gitlab',
        repoID,
        sha,
        // path: filepath,
      }
    })


    const decompressedCoverageMaps = await Promise.all(
      coverageMaps.map((coverageMap) => {
        // @ts-ignore
        return decompressedData(coverageMap.map).then((map) => {
          return map;
        });
      }),
    );


    const map = decompressedCoverageMaps.reduce((acc, cur) => {
      return {
        // @ts-ignore
        ...acc,
        // @ts-ignore
        [cur.path]: cur,
      };
    }, {})

    // @ts-ignore
    return reorganizeCompleteCoverageObjects(map,hit)
  }

  async acquireLock(lockName: string, lockTimeout: number): Promise<boolean> {
    const now = new Date();
    const expirationTime = new Date(now.getTime() + lockTimeout);
    try {
      // 查询锁
      const existingLock = await this.prisma.distributedlock.findUnique({
        where: {
          lockName,
        },
      });

      if (existingLock) {
        // 锁已存在，检查是否已过期或者已被释放
        if (existingLock.lockExpiration < now) {
          // 锁未被持有或者已过期，尝试更新锁
          await this.prisma.distributedlock.update({
            where: {
              lockName,
            },
            data: {
              lockTimestamp: now,
              lockExpiration: expirationTime,
            },
          });
          return true; // 锁获取成功
        } else {
          // 锁被其他实例持有且未过期
          return false; // 锁获取失败
        }
      } else {
        // 锁不存在，创建新锁
        await this.prisma.distributedlock.create({
          data: {
            lockName,
            isLocked: true,
            lockTimestamp: now,
            lockExpiration: expirationTime,
          },
        });
        return true; // 锁获取成功
      }
    } catch (error) {
      console.error('Error acquiring lock:', error);
      return false; // 锁获取失败
    }
  }

  async releaseLock(lockName: string): Promise<void> {
    await this.prisma.distributedlock.delete({
      where: {
        lockName,
      },
    });
  }
}
