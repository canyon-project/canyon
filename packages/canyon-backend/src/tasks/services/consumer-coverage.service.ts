import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  createNewCoverageData,
  deleteSpecificCoverageData,
  getSpecificCoverageData,
} from '../../adapter/coverage-data.adapter';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  mergeCoverageMap,
} from '@canyon/data';
import {
  deleteID,
  mapToLowerCamelCase,
  removeNullKeys,
} from '../../utils/utils';
import { PullChangeCodeAndInsertDbService } from './pull-change-code-and-insert-db.service';
import { logger } from '../../logger';
const randomInteger = Math.floor(Math.random() * 5000) + 5000;
import * as TestExclude from 'test-exclude';
@Injectable()
export class ConsumerCoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pullChangeCodeAndInsertDbService: PullChangeCodeAndInsertDbService,
  ) {}

  async markedAsConsumed(tx, normalCoverage) {
    return tx.coverage.update({
      where: {
        id: String(normalCoverage.id),
      },
      data: {
        consumer: 2,
      },
    });
  }
  async acquireLock(_lockName, timeout = 60000) {
    return this.prisma.$transaction(async (tx) => {
      try {
        const normalCoverage =
          await tx.$queryRaw`SELECT * FROM coverage WHERE cov_type = 'normal' AND consumer = 1 ORDER BY random() LIMIT 1`
            .then((res: any) =>
              res?.length > 0 ? mapToLowerCamelCase(res[0]) : null,
            )
            .catch((err) => {
              logger({
                type: 'error',
                title: '随机抽取时出错',
                message: String(err),
              });
              return null;
            });
        if (normalCoverage === null) {
          return false;
        }

        const lockName = `${_lockName}_${normalCoverage.projectID}_${normalCoverage.sha}`;

        const now = new Date();
        const expirationTime = new Date(now.getTime() + timeout);

        const existingLock = await tx.distributedlock.findUnique({
          where: {
            lockName,
          },
        });

        if (existingLock) {
          if (
            existingLock.lockExpiration.getTime() < now.getTime() ||
            !existingLock.isLocked
          ) {
            await tx.distributedlock.update({
              where: {
                lockName,
              },
              data: {
                isLocked: true,
                lockTimestamp: now,
                lockExpiration: expirationTime,
              },
            });
            await this.markedAsConsumed(tx, normalCoverage);
            return normalCoverage;
          } else {
            return false;
          }
        } else {
          await tx.distributedlock.create({
            data: {
              lockName,
              isLocked: true,
              lockTimestamp: now,
              lockExpiration: expirationTime,
            },
          });
          await this.markedAsConsumed(tx, normalCoverage);
          return normalCoverage;
        }
      } catch (e) {
        logger({
          type: 'error',
          title: 'acquireLock出现错误',
          message: String(e),
        });
        return null;
      }
    });
  }

  async filterCoverage(projectID, coverage) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });

    let matchRule: any = {}; // Default value

    try {
      // Attempt to parse project?.coverage
      matchRule = JSON.parse(project?.coverage || '{}');
    } catch (error) {
      // console.error('Error parsing coverage:', error);
      // Log the error or handle it as needed
      // You can also return an empty object or any default value
    }
    const exclude = new TestExclude({
      cwd: '~',
      include: matchRule.include,
      exclude: matchRule.exclude,
      extension: matchRule.extensions,
    });

    const filterCoverage = {};

    for (const filterCoverageKey of Object.keys(coverage)) {
      if (exclude.shouldInstrument(filterCoverageKey)) {
        filterCoverage[filterCoverageKey] = coverage[filterCoverageKey];
      }
    }
    return Object.keys(filterCoverage).length > 0 ? filterCoverage : coverage;
  }

  @Interval(randomInteger) //添加随机数，防止分布式服务同时执行，务必确保原子性，1-2s
  async lock() {
    const acquired = await this.acquireLock('consumer_coverage', 60000);

    // 操作开始

    if (acquired) {
      try {
        // 执行需要加锁的操作
        // Do something with the lock
        await this.consumerCoverage(acquired);
      } catch (e) {
        logger({
          type: 'error',
          title: '消费覆盖率数据时出错',
          message: String(e),
        });
        // 记录错误日志
        // 所有的异常都会被捕获
      } finally {
        await this.prisma.distributedlock
          .update({
            where: {
              lockName: `consumer_coverage_${acquired.projectID}_${acquired.sha}`,
            },
            data: {
              isLocked: false,
            },
          })
          .then((res) => {
            logger({
              type: 'info',
              title: '解锁成功',
              message: JSON.stringify(res),
            });
          })
          .catch((err) => {
            logger({
              type: 'error',
              title: '解锁失败',
              message: String(err),
            });
          });
      }
    } else {
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
  async consumerCoverage(normalCoverage) {
    // 获取与之对应的覆盖率数据
    const normalCoverageData = await getSpecificCoverageData(
      normalCoverage.relationID,
    );
    // 允许{}的数据，后面可以作为每个覆盖率的触发器
    // if (Object.keys(normalCoverageData).length === 0) {
    //   return;
    // }

    // 拉取变更代码
    await this.pullChangeCode(normalCoverage);
    // ************** 重要逻辑 **************
    // 关键逻辑，这里需要把normal的数据，分别聚合成agg和all的数据
    // ************** 重要逻辑 **************
    const covTypes = ['agg', 'all'];
    for (let i = 0; i < covTypes.length; i++) {
      // normal类型的数据，检查compareTarget，批量更新成最新的。
      if (covTypes[i] === 'agg') {
        await this.prisma.coverage.updateMany({
          where: {
            sha: normalCoverage.sha,
            projectID: normalCoverage.projectID,
          },
          data: {
            compareTarget: normalCoverage.compareTarget,
          },
        });
      }

      const covType = covTypes[i];
      const covTypeCoverage = await this.prisma.coverage.findFirst({
        where: removeNullKeys({
          covType: covType,
          sha: normalCoverage.sha,
          reportID: covType === 'agg' ? normalCoverage.reportID : null,
        }),
      });

      // covTypeCoverage为空，说明第一次，把CoverageData设置为{}

      // 这里重点关注！！！！！出错会把原来聚合的数据给覆盖掉
      // const covTypeCoverageData = covTypeCoverage
      //   ? await getSpecificCoverageData(covTypeCoverage.relationID)
      //   : {};

      let covTypeCoverageData = {};

      if (covTypeCoverage) {
        covTypeCoverageData = await getSpecificCoverageData(
          covTypeCoverage.relationID,
        );

        if (Object.keys(covTypeCoverageData).length === 0) {
          logger({
            type: 'error',
            title: 'CoverageData服务错误',
            message: `${covTypeCoverage.relationID}的数据获取错误`,
          });
          continue;
        }
      }

      // normalCoverageData来自循环外部，covTypeCoverageData来自循环内部
      const mainCov = mergeCoverageMap(covTypeCoverageData, normalCoverageData);
      // 判断是否需要拉取变更代码，对比sha和compareTarget
      const codechanges =
        normalCoverage.sha === normalCoverage.compareTarget
          ? []
          : await this.prisma.codechange.findMany({
              where: {
                sha: normalCoverage.sha,
                compareTarget: normalCoverage.compareTarget,
              },
            });

      const mainCovFilterCoverage = await this.filterCoverage(
        normalCoverage.projectID,
        mainCov,
      );

      // !!!!!/

      // 创建新的覆盖率数据
      const { insertedId: newKey } = await createNewCoverageData(
        mainCovFilterCoverage,
      );

      if (newKey === null) {
        logger({
          type: 'error',
          title: 'CoverageData服务错误',
          message: `${covTypeCoverage.relationID}的数据插入错误`,
        });
        continue;
      }

      // 删除老的summary数据
      await this.prisma.summary.deleteMany({
        where: removeNullKeys({
          reportID: covType === 'agg' ? normalCoverage.reportID : null,
          sha: normalCoverage.sha,
          covType: covType,
        }),
      });

      // 生成覆盖率概览数据
      const coverageSummaryMap = genSummaryMapByCoverageMap(
        mainCovFilterCoverage,
        codechanges,
      );
      const allSummary = getSummaryByPath('~', coverageSummaryMap);
      for (const allSummaryKey in allSummary) {
        // 落库数据
        const { total, skipped, covered } = allSummary[allSummaryKey] as any;
        await this.prisma.summary.create({
          data: {
            reportID: normalCoverage.reportID,
            metricType: allSummaryKey,
            sha: normalCoverage.sha,
            total,
            skipped,
            covered,
            covType: covType,
          },
        });
      }

      // 查询agg类型的数据，如果有就更新，没有就插入
      const updateCoverages = await this.prisma.coverage.findMany({
        where: removeNullKeys({
          covType: covType,
          sha: normalCoverage.sha,
          reportID: covType === 'agg' ? normalCoverage.reportID : null,
        }),
        orderBy: {
          createdAt: 'asc', //升序排，保留最老的数据
        },
      });

      if (updateCoverages.length > 0) {
        // 更新最老的那个数据
        const updateCoverage = updateCoverages[0];
        if (updateCoverages.length > 1) {
          logger({
            type: 'error',
            title: '覆盖率数据错误',
            message: `agg类型的数据有多个`,
          });
          await this.prisma.coverage.deleteMany({
            where: {
              id: {
                in: updateCoverages
                  .filter((_, index) => index !== 0) // 除了第一个
                  .map((item) => String(item.id)),
              },
            },
          });
        }

        await this.prisma.coverage.update({
          where: {
            id: String(updateCoverage.id),
          },
          data: {
            relationID: newKey,
            children: [
              ...(updateCoverage?.children || []),
              String(normalCoverage.id),
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            reporter: normalCoverage.reporter,
          },
        });
      } else {
        await this.prisma.coverage.create({
          data: {
            ...deleteID(normalCoverage),
            covType: covType,
            relationID: newKey,
            children: [String(normalCoverage.id)],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
      // 删除老的覆盖率数据，以前这里没做删除，导致数据越来越多，异步删除。
      if (covTypeCoverage?.relationID) {
        deleteSpecificCoverageData(covTypeCoverage.relationID);
      }
    }
  }
}
