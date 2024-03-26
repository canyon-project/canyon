import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
// import { CoverageAggTaskService } from './services/coverage-agg-task.service';
// import { CleaningUpOutdatedDataService } from './services/cleaning-up-outdated-data.service';
// import { RerunService } from './services/rerun.service';
// import { AggregationCoverageService } from './services/aggregation-coverage.service';
// import { PullChangeCodeAndInsertDbService } from './services/pull-change-code-and-insert-db.service';
import { ConsumerCoverageService } from './services/consumer-coverage.service';
import { CleaningUpOutdatedDataService } from './services/cleaning-up-outdated-data.service';
import { PullChangeCodeAndInsertDbService } from './services/pull-change-code-and-insert-db.service';
@Module({
  imports: [PrismaModule],
  providers: [
    // CoverageAggTaskService,
    // RerunService,
    CleaningUpOutdatedDataService,
    // AggregationCoverageService,
    PullChangeCodeAndInsertDbService,
    ConsumerCoverageService,
  ],
})
export class TasksModule {
  constructor() {
    console.log('TasksModule loaded');
  }
}
