import { Injectable, Logger } from '@nestjs/common';
import { logger } from '../../logger';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoverageLockService {
  private readonly logger = new Logger(CoverageLockService.name);
  private readonly lockTimeout = Number(
    process.env.COVERAGE_LOCK_TIMEOUT_MS || 300000, // 5分钟
  );

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 尝试获取分布式锁
   * @param coverageID 锁的标识符，格式：buildHash|sceneKey
   * @returns 是否成功获取锁
   */
  async acquireLock(coverageID: string): Promise<boolean> {
    try {
      // 清理过期的锁
      await this.cleanExpiredLocks();

      // 尝试插入锁（如果已存在则失败）
      // 注意：coverageID 是通过 generateObjectSignature 生成的哈希值，不会有 SQL 注入风险
      const lockedBy = process.env.HOSTNAME || `pid-${process.pid}`;
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO canyon_next_coverage_lock (coverage_id, locked_at, locked_by)
        VALUES ('${coverageID}', NOW(), '${lockedBy}')
      `);

      logger({
        type: 'debug',
        title: 'CoverageLock',
        message: 'Lock acquired',
        addInfo: { coverageID, lockedBy },
      });
      return true;
    } catch (e) {
      // 锁已存在，获取失败
      logger({
        type: 'debug',
        title: 'CoverageLock',
        message: 'Lock already exists',
        addInfo: {
          coverageID,
          error: e instanceof Error ? e.message : String(e),
        },
      });
      return false;
    }
  }

  /**
   * 释放分布式锁
   * @param coverageID 锁的标识符
   */
  async releaseLock(coverageID: string): Promise<void> {
    try {
      // 注意：coverageID 是通过 generateObjectSignature 生成的哈希值，不会有 SQL 注入风险
      await this.prisma.$executeRawUnsafe(`
        DELETE FROM canyon_next_coverage_lock
        WHERE coverage_id = '${coverageID}'
      `);

      logger({
        type: 'debug',
        title: 'CoverageLock',
        message: 'Lock released',
        addInfo: { coverageID },
      });
    } catch (e) {
      logger({
        type: 'warn',
        title: 'CoverageLock',
        message: 'Failed to release lock',
        addInfo: {
          coverageID,
          error: e instanceof Error ? e.message : String(e),
        },
      });
      // 忽略删除错误
    }
  }

  /**
   * 清理过期的锁
   */
  private async cleanExpiredLocks(): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(`
        DELETE FROM canyon_next_coverage_lock
        WHERE locked_at < NOW() - INTERVAL '${this.lockTimeout} milliseconds'
      `);
    } catch (e) {
      logger({
        type: 'warn',
        title: 'CoverageLock',
        message: 'Failed to clean expired locks',
        addInfo: {
          error: e instanceof Error ? e.message : String(e),
        },
      });
    }
  }
}
