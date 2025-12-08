import { Module } from '@nestjs/common';
import { RepoController } from './repo.controller';
import { RepoResolver } from './repo.resolver';
import { RepoService } from './repo.service';

@Module({
  imports: [],
  controllers: [RepoController],
  providers: [RepoService, RepoResolver],
})
export class RepoModule {}
