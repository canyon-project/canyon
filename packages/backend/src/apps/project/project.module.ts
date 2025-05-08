import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectController } from './project.controller';
import {GetRepoCommitsByRepoIdServices} from "./services/get-repo-commits-by-repo-id.services";
@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [
    GetRepoCommitsByRepoIdServices
  ],
  exports: [],
})
export class ProjectModule {}
