import { Injectable } from "@nestjs/common";
import {
    genSummaryMapByCoverageMap,
    getSummaryByPath,
    mergeCoverageMap,
} from "canyon-data";

import { CoveragediskService } from "./coveragedisk.service";
import { PrismaService } from "../../../../prisma/prisma.service";
import { summaryToDbSummary } from "../../../../utils/utils";
import { compressedData, decompressedData } from "canyon-map";
import { coverageObj } from "../../models/coverage.model";

import { IstanbulHitMapSchema } from "../../../../zod/istanbul.zod";
import { logger } from "../../../../logger";
import { PullChangeCodeAndInsertDbService } from "../common/pull-change-code-and-insert-db.service";
import { TestExcludeService } from "../common/test-exclude.service";
import { CoverageFinalService } from "../common/coverage-final.service";

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
        private readonly pullChangeCodeAndInsertDbService: PullChangeCodeAndInsertDbService,
        private readonly testExcludeService: TestExcludeService,
        private readonly coverageFinalService: CoverageFinalService,
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

                    const lockAcquired = await this.acquireLock(
                        lockName,
                        1000 * 60 * 2,
                    );

                    if (lockAcquired) {
                        const dataFormatAndCheckQueueDataToBeConsumed =
                            queueDataToBeConsumed;
                        try {
                            const reportIDs = [
                                ...new Set(
                                    dataFormatAndCheckQueueDataToBeConsumed.reportID.split(
                                        ",",
                                    ),
                                ),
                            ];
                            for (let i = 0; i < reportIDs.length; i++) {
                                await this.consume(
                                    Object.assign(
                                        dataFormatAndCheckQueueDataToBeConsumed,
                                        {
                                            reportID: reportIDs[i],
                                        },
                                    ),
                                    "agg",
                                );
                            }
                            await this.consume(
                                dataFormatAndCheckQueueDataToBeConsumed,
                                "all",
                            );
                            // 执行任务
                        } finally {
                            await this.releaseLock(lockName);
                        }
                    } else {
                        await this.coveragediskService.pushQueue(
                            queueDataToBeConsumed,
                        );
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
            where: {
                sha: queueDataToBeConsumed.sha,
                projectID: queueDataToBeConsumed.projectID,
                covType: covType,
                reportID:
                    covType === "agg"
                        ? queueDataToBeConsumed.reportID
                        : undefined,
            },
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

        // TODO cov应该是全量的，应该是find出来的hit，因为已经合并过了，避免重复

        // 关键节点，合并过后的数据，这里的合并并不需要map数据参与，也不一定，因为sourceMap的存在
        const mergedHit = mergeCoverageMap(
            queueDataToBeConsumed.coverage,
            // 不一定有
            await decompressedData(coverage?.hit),
        );

        const newCoverage = await this.coverageFinalService.invoke(
            {
                projectID: queueDataToBeConsumed.projectID,
                sha: queueDataToBeConsumed.sha,
                // 这里要手动指定reportID，因为如果是all类型，reportID也存在
                reportID:
                    covType === "agg"
                        ? queueDataToBeConsumed.reportID
                        : undefined,
            },
            mergedHit,
            true,
        );

        const summary = genSummaryMapByCoverageMap(
            await this.testExcludeService.invoke(
                queueDataToBeConsumed.projectID,
                newCoverage,
            ),
            codechanges,
        );
        const sum: any = getSummaryByPath("", summary);
        const summaryZstd = await compressedData(summary);

        // 实际存储不能用全量数据，大10倍，非常重要，只留下bfs的数据，体积小10倍，是reMap的
        const compressedHit = await compressedData(
            IstanbulHitMapSchema.parse(mergedHit),
        );
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
                },
            });
        }
    }
    async pullChangeCode(coverage) {
        if (coverage.sha !== coverage.compareTarget) {
            try {
                await this.pullChangeCodeAndInsertDbService.invoke({
                    projectID: coverage.projectID,
                    sha: coverage.sha,
                    compareTarget: coverage.compareTarget,
                });
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
