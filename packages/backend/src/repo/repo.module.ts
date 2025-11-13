import { Module } from '@nestjs/common';
import { RepoResolver } from './repo.resolver';
import { RepoService } from './repo.service';

@Module({
  imports: [],
  providers: [RepoService, RepoResolver],
})
export class RepoModule {}
