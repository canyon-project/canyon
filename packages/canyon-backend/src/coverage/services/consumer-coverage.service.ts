import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  mergeCoverageMap,
} from '@canyon/data';
import { removeNullKeys } from '../../utils/utils';
// import { validateObject } from '../../utils/coverage';
import { CoverageDataAdapterService } from './coverage-data-adapter.service';
import { PullChangeCodeAndInsertDbService } from './pull-change-code-and-insert-db.service';
import { logger } from '../../logger';
import { CoveragediskService } from './coveragedisk.service';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class ConsumerCoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageDataAdapterService: CoverageDataAdapterService,
    private readonly pullChangeCodeAndInsertDbService: PullChangeCodeAndInsertDbService,
    private readonly coveragediskService: CoveragediskService,
  ) {}

  async invoke() {
    while (true) {
      try {
        // 获取将要消费的队列数据，sha和projectID相同，并且已经聚合
        const queueDataToBeConsumed =
          await this.coveragediskService.getQueueWithSameShaAndProjectID();
        // 如果存在
        if (queueDataToBeConsumed) {
          const _lockName = 'consumer_coverage';
          const lockName = `${_lockName}_${queueDataToBeConsumed.projectID}_${queueDataToBeConsumed.sha}`;

          const lockAcquired = await this.acquireLock(lockName, 1000 * 60 * 2);

          if (lockAcquired) {
            try {
              await this.consume(queueDataToBeConsumed, 'agg');
              await this.consume(queueDataToBeConsumed, 'all');
              // 执行任务
            } finally {
              await this.releaseLock(lockName);
            }
          } else {
            await this.coveragediskService.pushQueue(queueDataToBeConsumed);
            await sleep(1000);
            // 锁已被其他实例持有，无法获取锁
          }
        } else {
          // 空闲等待1s，防止cpu占用过高
          await sleep(3000);
        }
      } catch (e) {
        console.log(e);
        await sleep(3000);
      }
    }
  }
  async consume(queueDataToBeConsumed, covType) {
    const coverage = await this.prisma.coverage.findFirst({
      where: removeNullKeys({
        sha: queueDataToBeConsumed.sha,
        projectID: queueDataToBeConsumed.projectID,
        covType: covType,
        reportID: covType === 'agg' ? queueDataToBeConsumed.reportID : null,
      }),
    });
    // 拉取变更代码
    await this.pullChangeCode(queueDataToBeConsumed);
    // 判断是否需要拉取变更代码，对比sha和compareTarget
    const codechanges =
      queueDataToBeConsumed.sha === queueDataToBeConsumed.compareTarget
        ? []
        : await this.prisma.codechange.findMany({
            where: {
              sha: queueDataToBeConsumed.sha,
              compareTarget: queueDataToBeConsumed.compareTarget,
            },
          });
    if (coverage) {
      const cov = await this.coverageDataAdapterService.retrieve(
        coverage.relationID,
      );

      const newcoverage = mergeCoverageMap(queueDataToBeConsumed.coverage, cov);

      await this.prisma.coverage.update({
        where: {
          id: coverage.id,
        },
        data: {
          summary: getSummaryByPath(
            '~',
            genSummaryMapByCoverageMap(newcoverage, codechanges),
          ) as any,
          updatedAt: new Date(),
          compareTarget: queueDataToBeConsumed.compareTarget,
        },
      }); // 更新时间
      const r = await this.coverageDataAdapterService.update(
        coverage.relationID,
        newcoverage,
      );
      return r;
    } else {
      // 创建新的agg
      const newAgg = await this.prisma.coverage.create({
        data: {
          covType: covType,
          covOrigin: 'handmade',
          relationID: '',
          summary: getSummaryByPath(
            '~',
            genSummaryMapByCoverageMap(
              queueDataToBeConsumed.coverage,
              codechanges,
            ),
          ) as any,
          //以下都读的是queueDataToBeConsumed
          key: queueDataToBeConsumed.key,
          branch: queueDataToBeConsumed.branch,
          sha: queueDataToBeConsumed.sha,
          compareTarget: queueDataToBeConsumed.compareTarget,
          projectID: queueDataToBeConsumed.projectID,
          provider: queueDataToBeConsumed.provider,
          instrumentCwd: queueDataToBeConsumed.instrumentCwd,
          reporter: String(queueDataToBeConsumed.reporter),
          reportID: queueDataToBeConsumed.reportID,
          tag: queueDataToBeConsumed.tag,
        },
      });
      const newcd = await this.coverageDataAdapterService.create(
        queueDataToBeConsumed.coverage,
        newAgg.id,
      );
      return this.prisma.coverage.update({
        where: {
          id: newAgg.id,
        },
        data: {
          relationID: newcd,
        },
      });
    }
  }
  async pullChangeCode(coverage) {
    if (coverage.sha !== coverage.compareTarget) {
      try {
        await this.pullChangeCodeAndInsertDbService.invoke(
          coverage.projectID,
          coverage.sha,
          coverage.compareTarget,
          'accessToken',
          this.prisma,
        );
      } catch (e) {
        logger({
          type: 'error',
          title: 'pullChangeCode',
          message: String(e),
        });
      }
    }
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