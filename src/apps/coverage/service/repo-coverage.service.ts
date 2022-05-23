import { Inject, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Repo } from '../entities/repo.entity'
import { Coverage } from '../entities/coverage.entity'
import { User } from '../../auth/entities/user.entity'
import { GitlabService } from '../../th/service/gitlab.service'
import * as moment from 'moment'
import { Model } from 'mongoose'
import { CoverageDocument } from '../schema/coverage.schema'
import CanyonUtil from 'canyon-util'
// moment.locale('zh_cn')

@Injectable()
export class RepoCoverageService {
  constructor(
    @Inject('MONGODB_CONNECTION_CoverageRepository')
    private coverageModel: Model<CoverageDocument>,
    @Inject('DATABASE_CONNECTION_RepoRepository')
    private repoRepository: Repository<Repo>,
    @Inject('DATABASE_CONNECTION_CoverageRepository')
    private coverageRepository: Repository<Coverage>,
    @Inject('user_REPOSITORY')
    private userRepository: Repository<User>,
    private readonly gitlabService: GitlabService,
  ) {}
  async invoke({ currentUser, thRepoId }) {
    const retrieveARepo = await this.gitlabService.retrieveARepo({
      currentUser: currentUser,
      thRepoId: thRepoId,
    })
    const repo = await this.repoRepository.findOne({
      thRepoId: retrieveARepo.id,
    })

    const coverageRepositoryFind = await this.coverageRepository
      .createQueryBuilder('coverage')
      .where({ repoId: repo.id })
      .leftJoinAndSelect(User, 'user', `user.id=coverage.reporter`)
      .select([
        'coverage.id as id',
        'coverage.commitSha as commitSha',
        'coverage.instrumentCwd as instrumentCwd',
        'coverage.createdAt as createdAt',
        'user.username as reporterUsername',
        'user.avatar as reporterAvatar',
      ])
      .getRawMany()
    const coverageRepositoryFindReduce = coverageRepositoryFind.reduce(
      (previousValue, currentValue) => {
        const find = previousValue.find(
          (item) => item.commitSha === currentValue.commitSha,
        )
        if (find) {
          find.times++
          find.record.push(currentValue)
        } else {
          previousValue.push({
            commitSha: currentValue.commitSha,
            times: 1,
            record: [currentValue],
          })
        }

        return previousValue
      },
      [],
    )

    const rows = []

    for (let i = 0; i < coverageRepositoryFindReduce.length; i++) {
      const gitlabService: any = await this.gitlabService.getASingleCommit({
        thRepoId,
        currentUser,
        commitSha: coverageRepositoryFindReduce[i].commitSha,
      })

      const row = {
        ...coverageRepositoryFindReduce[i],
        commitMsg: gitlabService.title,
        lastTimeReport: coverageRepositoryFindReduce[i].record.sort((a, b) =>
          moment(a.createdAt).isBefore(moment(b.createdAt)) ? -1 : 1,
        )[0].createdAt,
      }
      rows.push(row)
    }
    return rows
  }
}
