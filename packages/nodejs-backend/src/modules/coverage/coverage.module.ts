import { Module } from '@nestjs/common';
import { CoverageController } from './coverage.controller';
import { CoverageService } from './coverage.service';
import { SystemConfigModule } from '../system-config/system-config.module';
import { ChModule } from '../ch/ch.module';

@Module({
  imports: [ChModule, SystemConfigModule],
  controllers: [CoverageController],
  providers: [CoverageService]
})
export class CoverageModule {}


