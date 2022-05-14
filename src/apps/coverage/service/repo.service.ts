import { Inject, Injectable } from '@nestjs/common'
import { Between, In, Not, Repository } from 'typeorm'
import { Repo } from '../entities/repo.entity'
import { Coverage } from '../entities/coverage.entity'
import { User } from '../../auth/entities/user.entity'
import axios from 'axios'
import { GitlabService } from '../../th/service/gitlab.service'
import * as moment from 'moment'

@Injectable()
export class RepoService {
  constructor(
    @Inject('DATABASE_CONNECTION_RepoRepository')
    private repoRepository: Repository<Repo>,
    @Inject('DATABASE_CONNECTION_CoverageRepository')
    private coverageRepository: Repository<Coverage>,
    @Inject('user_REPOSITORY')
    private userRepository: Repository<User>,
    private readonly gitlabService: GitlabService,
  ) {}
  async repoList({ currentUser }) {
    // 1.查询所有仓库
    const repos = await this.repoRepository.find()
    // 2.去gitlab兑换
    const gitlabInfos = await this.gitlabService.repoList({
      currentUser: currentUser,
      repos,
    })
    // 3.构建数据rows
    const rows = []
    for (let i = 0; i < repos.length; i++) {
      // 4.根据repoId，到coverage表中获取对应的上报信息，降序
      const coverageRepositoryFind = await this.coverageRepository.find({
        where: {
          repoId: repos[i].id,
        },
        order: {
          createdAt: 'DESC',
        },
      })
      // 5.通过thRepoId查找到对应的gitlab 仓库信息
      const gitlabInfosFind = gitlabInfos.find(
        (item) => String(item.id) === repos[i].thRepoId,
      )
      // 6.拼装数据
      const row = {
        times: coverageRepositoryFind.length,
        lastTimeReport: coverageRepositoryFind[0].createdAt,
        id: gitlabInfosFind.id,
        pathWithNamespace: gitlabInfosFind.path_with_namespace,
      }
      rows.push(row)
    }
    return rows
  }

  async listCoverageCommit({ currentUser, thRepoId }) {
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

    // console.log(sss, 'sss')
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
