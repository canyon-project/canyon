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
export class TriggerAggCoverageService {
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
    const { reportId } = params
    // 查出所有commitShaList
    const commitShaList = await this.coverageRepository
      .find({ reportId: reportId, covType: 'normal' })
      .then((r) => [...new Set(r.map((i) => i.commitSha))])
    // 定义ids的list，后面拿出来查
    const ids = []
    for (let i = 0; i < commitShaList.length; i++) {
      const item = commitShaList[i]
      const checkIsHasAggCovType = await this.coverageRepository.findOne({
        commitSha: item,
        reportId,
        covType: 'agg',
      })
      // 拿个模版出来
      const template = await this.coverageRepository.findOne({
        commitSha: item,
        reportId,
      })

      if (!checkIsHasAggCovType) {
        //如果没有就创建
        const newCoverageModel = await this.coverageModel.create({
          coverage: '[]',
        })
        const newCoverageRepository = await this.coverageRepository.insert({
          commitSha: item,
          reportId,
          covType: 'agg',
          repoId: template.repoId,
          reporter: template.reporter,
          relationId: String(newCoverageModel._id),
          covAggStatus: 'processing',
        })
        ids.push({
          commitSha: item,
          mongoCoverageId: String(newCoverageModel._id),
          coverageId: newCoverageRepository.identifiers[0].id,
        })
      } else {
        // 如有有的话直接push
        ids.push({
          commitSha: item,
          mongoCoverageId: checkIsHasAggCovType.relationId,
          coverageId: checkIsHasAggCovType.id,
        })
        await this.coverageRepository.update(
          { id: checkIsHasAggCovType.id },
          { covAggStatus: 'processing' },
        )
      }
    }

    // 以下为覆盖率合并逻辑，这里采用的是查一个合并一个，速度可能比较慢，但是当覆盖率上报记录多的时候，一次查出来聚合内存会爆
    const coverageRepositoryFind = await this.coverageRepository.find({
      reportId: reportId,
      covType: 'normal',
    })
    const m = new Map()
    coverageRepositoryFind.forEach((item) => {
      if (m.has(item.commitSha)) {
      } else {
        m.set(item.commitSha, [])
      }
      m.get(item.commitSha).push(item)
    })

    // 转换为二维数组
    const twoDimensionalArray = Array.from(m)
    for (let i = 0; i < twoDimensionalArray.length; i++) {
      const item = twoDimensionalArray[i]
      const relationIds = item[1].map((item) => item.relationId)
      //  这边要逐个聚合，每次会有海量
      // 聚合好的覆盖率
      let mainCov = []
      for (let i = 0; i < relationIds.length; i++) {
        console.log(`正在合并第${i + 1}个`)
        const singleCov = await this.coverageModel
          .findOne({ _id: relationIds[i] })
          .then((r) => JSON.parse(r.coverage))
        mainCov = CanyonUtil.mergeCoverage([mainCov, singleCov])
      }

      const { mongoCoverageId, coverageId } = ids.find(
        (i) => i.commitSha === item[0],
      )
      await this.coverageModel.updateOne(
        { _id: mongoCoverageId },
        { coverage: JSON.stringify(mainCov) },
      )
      // 修改状态
      await this.coverageRepository.update(
        { id: coverageId },
        { covAggStatus: 'complete' },
      )
    }
    return { msg: '聚合中', ids }
  }
}
