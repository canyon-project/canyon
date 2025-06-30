import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RepoController } from './repo.controller';
import { GetRepoCommitsByRepoIdServices } from './services/get-repo-commits-by-repo-id.services';
import { GetRepoCommitByCommitShaServices } from './services/get-repo-commit-by-commit-sha.services';
import { CoverageFinalService } from '../coverage/services/core/coverage-final.service';
import { RepoService } from './services/repo.service';
@Module({
  imports: [PrismaModule],
  controllers: [RepoController],
  providers: [
    GetRepoCommitsByRepoIdServices,
    GetRepoCommitByCommitShaServices,
    CoverageFinalService,
    RepoService,
  ],
  exports: [],
})
export class RepoModule {}
