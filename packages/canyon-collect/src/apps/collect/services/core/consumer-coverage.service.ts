import { Injectable } from "@nestjs/common";
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
} from "../../../../canyon-data/src";

import { CoveragediskService } from "./coveragedisk.service";
import { PrismaService } from "../../../../prisma/prisma.service";
import { removeNullKeys } from "../../../../utils/utils";
import { compressedData, decompressedData } from "../../../../utils/zstd";
import { coverageObj } from "../../models/coverage.model";
import { mergeCoverageMap } from "canyon-data";
// import { resetCoverageDataMap } from 'canyon-data2';
import {
  remapCoverageWithInstrumentCwd,
  reorganizeCompleteCoverageObjects,
  resetCoverageDataMap,
} from "canyon-data2";

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
    // private readonly pullChangeCodeAndInsertDbService: PullChangeCodeAndInsertDbService,
    private readonly coveragediskService: CoveragediskService,
    // private readonly testExcludeService: TestExcludeService,
    // private readonly pullFilePathAndInsertDbService: PullFilePathAndInsertDbService,
  ) {}

  async invoke() {
    console.log("ConsumerCoverageService start!!!");
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
    // 读取agg类型的数据
    const coverage = await this.prisma.coverage.findFirst({
      where: removeNullKeys({
        sha: queueDataToBeConsumed.sha,
        projectID: queueDataToBeConsumed.projectID,
        covType: covType,
        reportID: covType === "agg" ? queueDataToBeConsumed.reportID : null,
      }),
    });
    const { map, instrumentCwd } = await this.prisma.coverage
      .findFirst({
        where: {
          sha: queueDataToBeConsumed.sha,
          projectID: queueDataToBeConsumed.projectID,
          covType: "all",
        },
      })
      .then(async (res) => {
        const map = await decompressedData(res.map);
        return {
          map: map,
          instrumentCwd: res.instrumentCwd,
        };
      });
    const codechanges = [];

    // TODO cov应该是全量的，应该是find出来的hit，因为已经合并过了，避免重复

    // 关键节点，合并过后的数据，这里的合并并不需要map数据参与，也不一定，因为sourceMap的存在
    const mergedHit = mergeCoverageMap(
      queueDataToBeConsumed.coverage,
      // 不一定有
      await decompressedData(coverage?.hit),
    );

    // map不参与exclude过滤，需要保留完整的

    const reMapMap = await remapCoverageWithInstrumentCwd(
      resetCoverageDataMap(map),
      instrumentCwd,
    );

    const newCoverage = reorganizeCompleteCoverageObjects(
      reMapMap, //
      mergedHit,
    );

    const summary = genSummaryMapByCoverageMap(
      // await this.testExcludeService.invoke(
      //   queueDataToBeConsumed.projectID,
      //   newCoverage,
      // ),
      newCoverage,
      codechanges,
    );
    const sum: any = getSummaryByPath("", summary);
    const summaryZstd = await compressedData(summary);

    // 实际存储不能用全量数据，大10倍
    const compressedHit = await compressedData(mergedHit);
    if (coverage) {
      await this.prisma.coverage.update({
        where: {
          id: coverage.id,
        },
        data: {
          hit: compressedHit,
          // newlinesCovered: sum.newlines.covered,
          // newlinesTotal: sum.newlines.total,
          statementsCovered: sum.statements.covered,
          statementsTotal: sum.statements.total,
          // functionsCovered: sum.functions.covered,
          // functionsTotal: sum.functions.total,
          // branchesCovered: sum.branches.covered,
          // branchesTotal: sum.branches.total,
          // linesCovered: sum.lines.covered,
          // linesTotal: sum.lines.total,
          summary: summaryZstd,
          updatedAt: queueDataToBeConsumed.updatedAt,
          compareTarget: queueDataToBeConsumed.compareTarget,
        },
      }); // 更新时间
    } else {
      // 创建新的agg
      await this.prisma.coverage.create({
        data: {
          ...coverageObj,
          hit: compressedHit,
          covType: covType,
          // newlinesCovered: sum.newlines.covered,
          // newlinesTotal: sum.newlines.total,
          statementsCovered: sum.statements.covered,
          statementsTotal: sum.statements.total,
          // functionsCovered: sum.functions.covered,
          // functionsTotal: sum.functions.total,
          // branchesCovered: sum.branches.covered,
          // branchesTotal: sum.branches.total,
          // linesCovered: sum.lines.covered,
          // linesTotal: sum.lines.total,
          summary: summaryZstd,
          //以下都读的是queueDataToBeConsumed
          // key: queueDataToBeConsumed.key,
          // branch: queueDataToBeConsumed.branch,
          sha: queueDataToBeConsumed.sha,
          // compareTarget: queueDataToBeConsumed.compareTarget,
          projectID: queueDataToBeConsumed.projectID,
          // provider: queueDataToBeConsumed.provider,
          // instrumentCwd: queueDataToBeConsumed.instrumentCwd,
          reporter: String(queueDataToBeConsumed.reporter),
          reportID: queueDataToBeConsumed.reportID,
          map: Buffer.from([]),
          // tag: queueDataToBeConsumed.tag,
          // buildID: queueDataToBeConsumed.buildID,
          // buildProvider: queueDataToBeConsumed.buildProvider,
        },
      });
    }
  }
  async pullChangeCode(coverage) {}

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
