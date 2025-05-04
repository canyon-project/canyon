import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectController } from './project.controller';
@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [],
  exports: [],
})
export class ProjectModule {}
