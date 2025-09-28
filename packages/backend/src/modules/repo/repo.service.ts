import { MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable, Optional } from '@nestjs/common';
import axios from 'axios';
import { CoverageEntity } from '../../entities/coverage.entity';
import { RepoEntity } from '../../entities/repo.entity';

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(RepoEntity)
    private readonly repoRepo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
  ) {}

  async getRepos(){
    const s = await this.repoRepo.findAll({
      where:{}
    })
    return {
      data: s,
      total: 100
    }
  }
}
