import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';

@Module({
  imports: [PrismaModule],
  controllers: [RepoController],
  providers: [RepoService],
  exports: [RepoService],
})
export class RepoModule {}
