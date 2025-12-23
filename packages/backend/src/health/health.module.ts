import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RuntimeController } from './runtime.controller';

console.log('1');
@Module({
  imports: [TerminusModule],
  controllers: [HealthController, RuntimeController],
})
export class HealthModule {}
