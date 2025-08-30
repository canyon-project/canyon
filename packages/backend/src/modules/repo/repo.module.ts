import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CoverageEntity } from '../../entities/coverage.entity';
import { RepoEntity } from '../../entities/repo.entity';
import { RepoResolver } from './repo.resolver';
import { RepoService } from './repo.service';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [RepoEntity, CoverageEntity] }),
  ],
  providers: [RepoService, RepoResolver],
})
export class RepoModule {}
