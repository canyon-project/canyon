import { Module } from '@nestjs/common';
import { CodeModule } from '../code/code.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectController } from './collect.controller';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageConsumerService } from './services/coverage-consumer.service';
import { CoverageLockService } from './services/coverage-lock.service';
import { CoverageMapInitService } from './services/coverage-map-init.service';

@Module({
  imports: [CodeModule, PrismaModule],
  controllers: [CollectController],
  providers: [
    CoverageClientService,
    CoverageMapInitService,
    CoverageConsumerService,
    CoverageLockService,
  ],
  exports: [CoverageMapInitService],
})
export class CollectModule {}
