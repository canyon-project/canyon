import { Inject, Injectable } from '@nestjs/common'
import { Between, In, Not, Repository } from 'typeorm'
import { Repo } from '../entities/repo.entity'
import { Coverage } from '../entities/coverage.entity'
import { User } from '../../auth/entities/user.entity'
import axios from 'axios'
import { GitlabService } from '../../th/service/gitlab.service'
import * as moment from 'moment'

@Injectable()
export class RepoListService {
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
    const gitlabRepoList = await this.gitlabService.repoList({
      currentUser: currentUser,
      thRepoIds: repos.map((item) => item.thRepoId),
    })
    // console.log(gitlabRepoList,'gitlabRepoList')
    // 3.构建数据rows
    const rows = []
    for (let i = 0; i < repos.length; i++) {
      console.log(repos[i].id,'repos[i].id')
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
      const gitlabRepoListFind = gitlabRepoList.find(
        (item) => String(item.id) === repos[i].thRepoId,
      )
      console.log(coverageRepositoryFind,'coverageRepositoryFind')
      // 6.拼装数据
      const row = {
        times: coverageRepositoryFind.length,
        lastTimeReport: coverageRepositoryFind[0].createdAt,
        id: gitlabRepoListFind.id,
        pathWithNamespace: gitlabRepoListFind.path_with_namespace,
      }
      rows.push(row)
    }
    return rows
  }
}
