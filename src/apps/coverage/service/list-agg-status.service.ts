import { Inject, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Coverage } from '../entities/coverage.entity'
import { User } from '../../auth/entities/user.entity'
import { CoverageDocument } from '../schema/coverage.schema'
import { Model } from 'mongoose'
import CanyonUtil from 'canyon-util'
import { Repo } from '../entities/repo.entity'
import { GitlabService } from '../../th/service/gitlab.service'

@Injectable()
export class ListAggStatusService {
  constructor(
    @Inject('MONGODB_CONNECTION_CoverageRepository')
    private coverageModel: Model<CoverageDocument>,
    @Inject('DATABASE_CONNECTION_CoverageRepository')
    private coverageRepository: Repository<Coverage>,
    @Inject('user_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('DATABASE_CONNECTION_RepoRepository')
    private repoRepository: Repository<Repo>,
    private readonly gitlabService: GitlabService,
  ) {}

  async invoke(params) {
    const where = {
      covType: 'agg',
      reportId: params.reportId,
    }
    return this.coverageRepository.find(JSON.parse(JSON.stringify(where)))
  }
}
