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
moment.locale('zh_cn')
function calculatePercentage(a, b) {
  if (b === 0) {
    return 0
  } else {
    return Number(((a * 100) / b).toFixed(2))
  }
}

@Injectable()
export class RepoSummaryService {
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
      .orderBy({
        createdAt: 'DESC',
      })
      .leftJoinAndSelect(User, 'user', `user.id=coverage.reporter`)
      .select([
        'coverage.id as id',
        'coverage.commitSha as commitSha',
        'coverage.instrumentCwd as instrumentCwd',
        'coverage.relationId as relationId',
        'coverage.createdAt as createdAt',
        'user.username as reporterUsername',
        'user.avatar as reporterAvatar',
      ])
      .getRawMany()

    const lastTimeReport = coverageRepositoryFind[0].createdAt

    //
    // const coverageRepositoryFind = await this.coverageRepository.find({
    //   repoId: repo.id,
    // })
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

      const cov = []

      const record = coverageRepositoryFindReduce[i].record
      for (let j = 0; j < record.length; j++) {
        const c = await this.coverageModel.findOne({
          _id: record[j].relationId,
        })
        cov.push(JSON.parse(c.coverage))
      }

      const genTreeSummaryMain = CanyonUtil.genTreeSummaryMain(
        CanyonUtil.mergeCoverage(cov),
      )

      console.log(gitlabService.committed_date, 'gitlabService')

      const row = {
        ...coverageRepositoryFindReduce[i],
        commitMsg: gitlabService.title,
        commitTime: gitlabService.committed_date,
        lastTimeReport: coverageRepositoryFindReduce[i].record.sort((a, b) =>
          moment(a.createdAt).isBefore(moment(b.createdAt)) ? -1 : 1,
        )[0].createdAt,
        summary: {
          topLevelDir: genTreeSummaryMain[0].fullPath,
          statistics: genTreeSummaryMain[0].statistics,
        },
        coverage: calculatePercentage(
          genTreeSummaryMain[0].statistics.statements.covered,
          genTreeSummaryMain[0].statistics.statements.total,
        ),
      }
      rows.push(row)
    }

    const lastTimeCommit = rows[0].coverage

    return {
      gongGeData: [
        {
          label: '总共上报',
          value: coverageRepositoryFind.length,
        },
        {
          label: '平均覆盖率',
          value:
            String(rows
                .map((item) => item.coverage)
                .reduce((p, c) => {
                  p = p + c
                  return p
                }, 0) / rows.length) + '%',
        },
        {
          label: '最近一次上报',
          value: moment(lastTimeReport).fromNow(),
        },
        {
          label: '最近一次commit覆盖率',
          value: String(lastTimeCommit) + '%',
        },
      ],
      chartData: rows,
      // t: gitlabService,
    }
  }
}
