import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectResolver } from './project.resolver';
import { GetProjectsService } from './services/get-projects.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ProjectResolver, GetProjectsService],
  exports: [],
})
export class ProjectModule {}
