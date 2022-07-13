import { Inject, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Coverage } from '../entities/coverage.entity'
import { User } from '../../auth/entities/user.entity'
import { CoverageDocument } from '../schema/coverage.schema'
import { Model } from 'mongoose'
import CanyonUtil from 'canyon-util'
import { Repo } from '../entities/repo.entity'
import { GitlabService } from '../../th/service/gitlab.service'

/**
 * 获取覆盖率概览
 */

// 根据条件查询覆盖率list，最后还是得按照commit聚合，返回一个数组

@Injectable()
export class RetrieveCoverageTreeSummaryService {
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
    console.log(params, 'params')
    const { reportId } = params
    const redirectUri = global.conf.gitlab.application.redirectUri
    const coverageRepositoryFind = await this.coverageRepository.find({
      reportId: reportId,
    })
    const allCoverages = await Promise.all(
      coverageRepositoryFind.map((item) => {
        return this.coverageModel
          .findOne({ _id: item.relationId })
          .then((r) => ({
            coverage: JSON.parse(r.coverage),
            relationId: item.relationId,
          }))
      }),
    )

    const m = new Map()
    coverageRepositoryFind.forEach((item) => {
      if (m.has(item.commitSha)) {
      } else {
        m.set(item.commitSha, [])
      }
      m.get(item.commitSha).push(item)
    })
    const res = Array.from(m).map((item) => {
      const relationIds = item[1].map((item) => item.relationId)
      return {
        reportUrl: `${redirectUri.replace(
          '/login',
          '',
        )}/redirect?type=reportId&id=${reportId}&commitSha=${item[0]}`,
        commitSha: item[0],
        aggRows: item[1],
        treeSummary: CanyonUtil.genTreeSummaryMain(
          CanyonUtil.mergeCoverage(
            allCoverages
              .filter((i) => relationIds.includes(i.relationId))
              .map((i) => i.coverage),
          ),
        ),
      }
    })
    return res
  }
}
