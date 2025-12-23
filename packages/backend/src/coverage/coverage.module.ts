import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CoverageController } from './coverage.controller';
import { CoverageCommitsService } from './services/coverage-commits.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@Module({
  imports: [PrismaModule],
  controllers: [CoverageController],
  providers: [CoverageMapForCommitService, CoverageCommitsService],
})
export class CoverageModule {}
