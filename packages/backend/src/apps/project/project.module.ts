import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectResolver } from './project.resolver';
import { GetProjectsService } from './services/get-projects.service';
import {GetProjectCommitsService} from "./services/get-project-commits.service";
import {GetProjectCommitCoverageService} from "./services/get-project-commit-coverage.service";

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ProjectResolver, GetProjectsService,GetProjectCommitsService,GetProjectCommitCoverageService],
  exports: [],
})
export class ProjectModule {}
