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
  async invoke({ currentUser, thRepoId, lang }) {
    moment.locale(lang)
    // 1.根据id查询gitlab项目信息
    const gitlabRetrieveARepo = await this.gitlabService.retrieveARepo({
      currentUser: currentUser,
      thRepoId: thRepoId,
    })
    // 2.根据gitlab仓库id查询到canyon的仓库id
    const repo = await this.repoRepository.findOne({
      thRepoId: gitlabRetrieveARepo.id,
    })
    // 3.和user表联查出覆盖率信息
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

    // 最近一次上报人
    const lastTimeReport = coverageRepositoryFind[0].createdAt
    // 根据commit信息聚合数据
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
      // 每次循环根据commitSha把覆盖率都查出来
      const cov = []
      const record = coverageRepositoryFindReduce[i].record
      for (let j = 0; j < record.length; j++) {
        const c = await this.coverageModel.findOne({
          _id: record[j].relationId,
        })
        try {
          cov.push(JSON.parse(c.coverage))
        } catch (e) {}
      }
      //调用canyon覆盖率合并方法合并覆盖率，然后在计算概览
      const genTreeSummaryMain = CanyonUtil.genTreeSummaryMain(
        CanyonUtil.mergeCoverage(cov),
      )
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
          label: 'totalTimes',
          value: coverageRepositoryFind.length,
        },
        {
          label: 'averageCoverage',
          value:
            Number(
              Number(
                rows
                  .map((item) => item.coverage)
                  .reduce((p, c) => {
                    p = p + c
                    return p
                  }, 0) / rows.length,
              ).toFixed(2),
            ) + '%',
        },
        {
          label: 'lastReportTime',
          value: moment(lastTimeReport).fromNow(),
        },
        {
          label: 'lastCommitCoverage',
          value: String(lastTimeCommit) + '%',
        },
      ],
      chartData: rows.reverse(),
    }
  }
}
