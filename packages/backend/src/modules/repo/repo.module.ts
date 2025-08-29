import { Module } from '@nestjs/common'
import { RepoService } from './repo.service'
import { RepoResolver } from './repo.resolver'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { RepoEntity } from '../../entities/repo.entity'

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [RepoEntity] })],
  providers: [RepoService, RepoResolver],
})
export class RepoModule {}
