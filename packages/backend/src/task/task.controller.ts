import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { TaskService } from './task.service';

@Public()
@Controller('api/task')
export class TaskController {
  constructor(
    // private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly taskService: TaskService,
  ) {}

  @Get('/coverage/agg')
  async taskCoverageAgg() {
    return this.taskService.taskCoverageAgg();
  }

  @Get('/coverage/del')
  async taskCoverageDel() {
    return this.taskService.taskCoverageDel();
  }
}
