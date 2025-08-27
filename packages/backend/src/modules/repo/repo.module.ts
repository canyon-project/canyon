import { Module } from '@nestjs/common'
import { RepoService } from './repo.service'
import { RepoResolver } from './repo.resolver'
import {OrmModule} from "../orm/orm.module";

@Module({
  imports:[OrmModule],
  providers: [RepoService, RepoResolver],
})
export class RepoModule {}
