import * as process from 'node:process';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
// import { remapCoverageByOld } from '../collect/helpers/canyon-data';
// import { decodeCompressedObject } from '../collect/helpers/transform';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TaskService.name);
  private pollTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly pollIntervalMs = Number(
    process.env.TASK_COVERAGE_AGG_POLL_MS || 3000,
  );
  private delPollTimer: NodeJS.Timeout | null = null;
  private isDelRunning = false;
  private readonly delPollIntervalMs = Number(
    process.env.TASK_COVERAGE_DEL_POLL_MS || 30000,
  );

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // process.env['START_DISTRIBUTED_TASK']
    // 启动自轮询任务
    // this.startPolling();
    // this.startDelPolling();
  }

  async onModuleDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.delPollTimer) {
      clearInterval(this.delPollTimer);
      this.delPollTimer = null;
    }
  }
}
