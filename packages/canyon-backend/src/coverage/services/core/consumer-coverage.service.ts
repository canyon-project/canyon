import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  mergeCoverageMap,
} from '@canyon/data';
import { percent, removeNullKeys } from '../../../utils/utils';
import { CoverageDataAdapterService } from '../common/coverage-data-adapter.service';
import { PullChangeCodeAndInsertDbService } from '../common/pull-change-code-and-insert-db.service';
import { logger } from '../../../logger';
import { CoveragediskService } from './coveragedisk.service';
import { TestExcludeService } from '../common/test-exclude.service';
import { formatReportObject } from '../../../utils/coverage';
import { resolveProjectID } from '../../../utils';
import { PullFilePathAndInsertDbService } from '../common/pull-file-path-and-insert-db.service';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class ConsumerCoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageDataAdapterService: CoverageDataAdapterService,
    private readonly pullChangeCodeAndInsertDbService: PullChangeCodeAndInsertDbService,
    private readonly coveragediskService: CoveragediskService,
    private readonly testExcludeService: TestExcludeService,
    private readonly pullFilePathAndInsertDbService: PullFilePathAndInsertDbService,
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
            const project = await this.prisma.project.findFirst({
              where: {
                id: queueDataToBeConsumed.projectID,
              },
            });
            // 到这里，获取到锁了以后再作处理
            const dataFormatAndCheckQueueDataToBeConsumed =
              await this.dataFormatAndCheck(
                queueDataToBeConsumed,
                project?.instrumentCwd,
              );
            try {
              await this.consume(
                dataFormatAndCheckQueueDataToBeConsumed,
                'agg',
              );
              await this.consume(
                dataFormatAndCheckQueueDataToBeConsumed,
                'all',
              );
              // 这里有需要补偿变更行覆盖率，因为一些懒加载的原因，可能导致每个agg类型的变更行数量不一样。所以每次更新后，需要更新一下所有agg的变更行覆盖率summary
              await this.compensationChangeLineCoverageSummary(
                dataFormatAndCheckQueueDataToBeConsumed,
              );
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
    // 异步拉取文件路径，不影响主消费任务，耗时比较长
    await this.pullFilePathAndInsertDbService.invoke(
      queueDataToBeConsumed.projectID,
      queueDataToBeConsumed.sha,
      this.prisma,
    );
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
            genSummaryMapByCoverageMap(
              await this.testExcludeService.invoke(
                queueDataToBeConsumed.projectID,
                newcoverage,
              ),
              codechanges,
            ),
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
          relationID: '',
          summary: getSummaryByPath(
            '~',
            genSummaryMapByCoverageMap(
              await this.testExcludeService.invoke(
                queueDataToBeConsumed.projectID,
                queueDataToBeConsumed.coverage,
              ),
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
          resolveProjectID(coverage.projectID),
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
  async dataFormatAndCheck(data, projectInstrumentCwd): Promise<any> {
    data = this.regularData(data);
    const instrumentCwd = projectInstrumentCwd || data.instrumentCwd;
    const noPass = [];
    for (const coverageKey in data.coverage) {
      if (coverageKey.includes(instrumentCwd)) {
      } else {
        noPass.push(coverageKey);
      }
    }
    if (noPass.length > 0) {
      console.log(`coverage对象与canyon.processCwd不匹配`);
    }

    // 3.修改覆盖率路径
    // 考虑到会出现大数的情况
    // CanyonUtil.formatReportObject上报时就开启源码回溯
    const coverage = await formatReportObject({
      coverage: data.coverage,
      instrumentCwd,
    }).then((res) => res.coverage);
    return {
      ...data,
      coverage: coverage,
    };
  }

  regularData(data: any) {
    const obj = {};
    const { coverage } = data;
    // 针对windows电脑，把反斜杠替换成正斜杠
    // 做数据过滤，去除 \u0000 字符
    for (const coverageKey in coverage) {
      if (!coverageKey.includes('\u0000')) {
        obj[coverageKey] = coverage[coverageKey];
      }
    }
    return {
      ...data,
      coverage: obj,
    };
  }

  async compensationChangeLineCoverageSummary(queueDataToBeConsumed) {
    // 查询all类型的coverage
    const allCoverage = await this.prisma.coverage.findFirst({
      where: {
        projectID: queueDataToBeConsumed.projectID,
        sha: queueDataToBeConsumed.sha,
        covType: 'all',
      },
    });
    // 变更行数量0，不需要补偿
    if ((allCoverage.summary as any).newlines.total === 0) {
      // 查询agg类型的coverage
      const aggCoverages = await this.prisma.coverage.findMany({
        where: {
          projectID: queueDataToBeConsumed.projectID,
          sha: queueDataToBeConsumed.sha,
          covType: 'agg',
        },
      });
      // 补偿函数
      function compensation(oldSummary, newSummary) {
        return {
          ...oldSummary,
          newlines: {
            ...oldSummary.newlines,
            total: newSummary.newlines.total,
            pct: percent(
              oldSummary.newlines.covered,
              newSummary.newlines.total,
            ),
          },
        };
      }
      // 更新agg类型的coverage
      for (let i = 0; i < aggCoverages.length; i++) {
        const oldSummary = aggCoverages[i].summary;
        await this.prisma.coverage.update({
          where: {
            id: aggCoverages[i].id,
          },
          data: {
            summary: compensation(oldSummary, allCoverage.summary),
          },
        });
      }
    }
  }
}
