import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CoverageController } from './coverage.controller';
import { CoverageFinalService } from './services/core/coverage-final.service';

@Module({
  imports: [PrismaModule],
  controllers: [CoverageController],
  providers: [ CoverageFinalService],
})
export class CoverageModule {}
