import { Module } from '@nestjs/common';
import { TaskService } from './task.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TaskService],
})
export class TaskModule {}
