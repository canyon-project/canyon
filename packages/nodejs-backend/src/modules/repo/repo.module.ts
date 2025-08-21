import { Module } from '@nestjs/common';
import { RepoService } from './repo.service';
import { RepoResolver } from './repo.resolver';

@Module({
  providers: [RepoService, RepoResolver]
})
export class RepoModule {}


