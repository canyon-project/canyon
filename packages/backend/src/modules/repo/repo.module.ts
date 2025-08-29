import { Module } from '@nestjs/common'
import { RepoService } from './repo.service'
import { RepoResolver } from './repo.resolver'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { RepoEntity } from '../../entities/repo.entity'
import {CoverageEntity} from "../../entities/coverage.entity";

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [RepoEntity,CoverageEntity] })],
  providers: [RepoService, RepoResolver],
})
export class RepoModule {}
