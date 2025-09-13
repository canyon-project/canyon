import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CoverageEntity } from '../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity';
import { RepoEntity } from '../../entities/repo.entity';
import { ChModule } from '../ch/ch.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { CoverageController } from './coverage.controller';
import { CoverageOverviewResolver } from './coverage.resolver';
import { CoverageMapStoreService } from './services/coverage.map-store.service';
// import { CoverageGitService } from './services/coverage.git.service';
// import { CoverageMapService } from './services/coverage.map.service';
// import { CoverageMapStoreService } from './services/coverage.map-store.service';
import { CoverageOverviewService } from './services/coverage.overview.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [CoverageEntity, CoverageMapRelationEntity, RepoEntity],
    }),
    ChModule,
    SystemConfigModule,
  ],
  controllers: [CoverageController],
  providers: [
    CoverageOverviewService,
    CoverageMapForCommitService,
    // CoverageMapService,
    CoverageMapStoreService,
    // CoverageGitService,
    CoverageOverviewResolver,
  ],
})
export class CoverageModule {}
