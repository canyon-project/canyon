import { Module } from '@nestjs/common';
import { CollectController } from './collect.controller';
import { CoverageClientService } from './services/coverage-client.service';
// import { CoverageConsumerService } from './services/coverage-consumer.service';

@Module({
  imports: [],
  controllers: [CollectController],
  providers: [CoverageClientService],
})
export class CollectModule {}
