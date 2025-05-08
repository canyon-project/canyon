import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectController } from './project.controller';
import { GetRepoCommitsByRepoIdServices } from './services/get-repo-commits-by-repo-id.services';
import { GetRepoCommitByCommitShaServices } from './services/get-repo-commit-by-commit-sha.services';
import {CoverageFinalService} from "../coverage/services/core/coverage-final.service";
@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [GetRepoCommitsByRepoIdServices, GetRepoCommitByCommitShaServices,CoverageFinalService],
  exports: [],
})
export class ProjectModule {}
