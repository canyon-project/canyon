import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { ConfigEntity } from '../../entities/config.entity'
import { CoverageEntity } from '../../entities/coverage.entity'
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity'
import {RepoEntity} from "../../entities/repo.entity";

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [ConfigEntity, CoverageEntity, CoverageMapRelationEntity,RepoEntity],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
