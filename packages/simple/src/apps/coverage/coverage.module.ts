import { Module } from '@nestjs/common';
// import { PrismaModule } from '../../prisma/prisma.module';
import { CoverageController } from './coverage.controller';
import { CoverageClientService } from './services/coverage-client.service';
import { SimpleCoverage } from './entities/simple-coverage.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoveragePreStoreService } from './services/coverage-pre-store.service';
// import { CoverageFinalService } from './services/core/coverage-final.service';

@Module({
  imports: [TypeOrmModule.forFeature([SimpleCoverage])],
  controllers: [CoverageController],
  providers: [CoverageClientService, CoveragePreStoreService],
})
export class CoverageModule {}
