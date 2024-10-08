import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { genSummaryMapByCoverageMap, getSummaryByPath } from "canyon-data";
import { mergeCoverageMap, resetCoverageData } from "../../../utils/coverage";
import { removeNullKeys, resolveProjectID } from "../../../utils/utils";
import { PullChangeCodeAndInsertDbService } from "../common/pull-change-code-and-insert-db.service";
import { logger } from "../../../logger";
import { CoveragediskService } from "./coveragedisk.service";
import { TestExcludeService } from "../common/test-exclude.service";
import { PullFilePathAndInsertDbService } from "../common/pull-file-path-and-insert-db.service";
import { compressedData, decompressedData } from "../../../utils/zstd";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class ConsumerCoverageService {
  constructor(
    private readonly prisma: PrismaService,
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
          const _lockName = "consumer_coverage";
          const lockName = `${_lockName}_${queueDataToBeConsumed.projectID}_${queueDataToBeConsumed.sha}`;

          const lockAcquired = await this.acquireLock(lockName, 1000 * 60 * 2);

          if (lockAcquired) {
            // const project = await this.prisma.project.findFirst({
            //   where: {
            //     id: queueDataToBeConsumed.projectID,
            //   },
            // });
            // 到这里，获取到锁了以后再作处理
            // const dataFormatAndCheckQueueDataToBeConsumed =
            //   await this.dataFormatAndCheck(
            //     queueDataToBeConsumed,
            //     project?.instrumentCwd,
            //   );
            const dataFormatAndCheckQueueDataToBeConsumed =
              queueDataToBeConsumed;
            try {
              await this.consume(
                dataFormatAndCheckQueueDataToBeConsumed,
                "agg",
              );
              await this.consume(
                dataFormatAndCheckQueueDataToBeConsumed,
                "all",
              );
              // 这里有需要补偿变更行覆盖率，因为一些懒加载的原因，可能导致每个agg类型的变更行数量不一样。所以每次更新后，需要更新一下所有agg的变更行覆盖率summary
              // await this.compensationChangeLineCoverageSummary(
              //   dataFormatAndCheckQueueDataToBeConsumed,
              // );
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
        reportID: covType === "agg" ? queueDataToBeConsumed.reportID : null,
      }),
    });
    // 异步拉取文件路径，不影响主消费任务，耗时比较长
    // await this.pullFilePathAndInsertDbService.invoke(
    //   queueDataToBeConsumed.projectID,
    //   queueDataToBeConsumed.sha,
    //   this.prisma,
    // );
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

    const cov = await (async () => {
      const cov0 = coverage
        ? await decompressedData(coverage.hit).then((r) => JSON.parse(r))
        : {};
      // 在agg类型聚合的时候，把init的数据也聚合进去
      const initCoverage = await this.prisma.coverage.findFirst({
        where: {
          sha: queueDataToBeConsumed.sha,
          projectID: queueDataToBeConsumed.projectID,
          covType: "all",
        },
      });
      if (initCoverage) {
        const initCov = await decompressedData(initCoverage.hit).then((r) =>
          JSON.parse(r),
        );
        return mergeCoverageMap(resetCoverageData(initCov), cov0);
      } else {
        return cov0;
      }
    })();

    const newcoverage = mergeCoverageMap(queueDataToBeConsumed.coverage, cov);
    const summary = genSummaryMapByCoverageMap(
      await this.testExcludeService.invoke(
        queueDataToBeConsumed.projectID,
        newcoverage,
      ),
      codechanges,
    );
    const sum: any = getSummaryByPath("", summary);
    const summaryZstd = await compressedData(JSON.stringify(summary));

    const hit = await compressedData(JSON.stringify(newcoverage));
    if (coverage) {
      await this.prisma.coverage.update({
        where: {
          id: coverage.id,
        },
        data: {
          hit: hit,
          newlinesCovered: sum.newlines.covered,
          newlinesTotal: sum.newlines.total,
          statementsCovered: sum.statements.covered,
          statementsTotal: sum.statements.total,
          functionsCovered: sum.functions.covered,
          functionsTotal: sum.functions.total,
          branchesCovered: sum.branches.covered,
          branchesTotal: sum.branches.total,
          linesCovered: sum.lines.covered,
          linesTotal: sum.lines.total,
          summary: summaryZstd,
          updatedAt: queueDataToBeConsumed.updatedAt,
          compareTarget: queueDataToBeConsumed.compareTarget,
        },
      }); // 更新时间
    } else {
      // 创建新的agg
      await this.prisma.coverage.create({
        data: {
          hit: hit,
          covType: covType,
          newlinesCovered: sum.newlines.covered,
          newlinesTotal: sum.newlines.total,
          statementsCovered: sum.statements.covered,
          statementsTotal: sum.statements.total,
          functionsCovered: sum.functions.covered,
          functionsTotal: sum.functions.total,
          branchesCovered: sum.branches.covered,
          branchesTotal: sum.branches.total,
          linesCovered: sum.lines.covered,
          linesTotal: sum.lines.total,
          summary: summaryZstd,
          //以下都读的是queueDataToBeConsumed
          // key: queueDataToBeConsumed.key,
          branch: queueDataToBeConsumed.branch,
          sha: queueDataToBeConsumed.sha,
          compareTarget: queueDataToBeConsumed.compareTarget,
          projectID: queueDataToBeConsumed.projectID,
          provider: queueDataToBeConsumed.provider,
          // instrumentCwd: queueDataToBeConsumed.instrumentCwd,
          reporter: String(queueDataToBeConsumed.reporter),
          reportID: queueDataToBeConsumed.reportID,
          // tag: queueDataToBeConsumed.tag,
          buildID: queueDataToBeConsumed.buildID,
          buildProvider: queueDataToBeConsumed.buildProvider,
          createdAt: queueDataToBeConsumed.createdAt,
          updatedAt: queueDataToBeConsumed.updatedAt,
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
          "accessToken",
          this.prisma,
        );
      } catch (e) {
        logger({
          type: "error",
          title: "pullChangeCode",
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
      console.error("Error acquiring lock:", error);
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
