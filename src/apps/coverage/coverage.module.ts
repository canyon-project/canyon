import { Module } from '@nestjs/common'
import { RepoListService } from './service/repo-list.service'
import { RepoController } from './controller/repo.controller'
import { coverageProviders } from './providers/coverage.providers'
import { DatabaseModule } from '../database/database.module'
import { CoverageController } from './controller/coverage.controller'
import { CoverageClientService } from './service/coverage-client.service'
import { FileContentService } from './service/file-content.service'
import { GitlabService } from '../th/service/gitlab.service'
import { RepoSummaryService } from './service/repo-summary.service'
import { RepoCoverageService } from './service/repo-coverage.service'

@Module({
  imports: [DatabaseModule],
  controllers: [RepoController, CoverageController],
  providers: [
    RepoListService,
    CoverageClientService,
    FileContentService,
    GitlabService,
    RepoSummaryService,
    RepoCoverageService,
    ...coverageProviders,
  ],
})
export class CoverageModule {}
