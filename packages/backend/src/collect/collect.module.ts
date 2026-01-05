import { Module } from '@nestjs/common';
import { CollectController } from './collect.controller';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageConsumerService } from './services/coverage-consumer.service';
import { CoverageLockService } from './services/coverage-lock.service';
import { CoverageMapInitService } from './services/coverage-map-init.service';

@Module({
  imports: [],
  controllers: [CollectController],
  providers: [
    CoverageClientService,
    CoverageMapInitService,
    CoverageConsumerService,
    CoverageLockService,
  ],
})
export class CollectModule {}
