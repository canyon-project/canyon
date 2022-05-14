import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Coverage } from '../entities/coverage.entity'
import { User } from '../../auth/entities/user.entity'

import axios from 'axios'
import { Model } from 'mongoose'
import { CoverageDocument } from '../schema/coverage.schema'

import CanyonUtil from 'canyon-util'

@Injectable()
export class FileContentService {
  constructor(
    @Inject('DATABASE_CONNECTION_CoverageRepository')
    private coverageRepository: Repository<Coverage>,
    @Inject('user_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('MONGODB_CONNECTION_CoverageRepository')
    private coverageModel: Model<CoverageDocument>,
  ) {}

  async invoke(params: any) {
    const { filePath, commitSha, projectId } = params
    const token = await this.userRepository
      .findOne({ id: 1 })
      .then((res) => res.thAccessToken)

    const res = await axios
      .get(
        `https://gitlab.com/api/v4/projects/35883228/repository/files/${encodeURIComponent(
          decodeURIComponent(filePath),
        )}`,
        {
          params: {
            ref: commitSha,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        return {
          ...res.data,
        }
      })
      .catch((err) => {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: '没有找到对应文件',
          },
          HttpStatus.BAD_REQUEST,
        )
      })

    // 这里准备覆盖率数据
    // await this.coverageRepository
    // const { commitSha } = params
    const coverageRepositoryFindResult = await this.coverageRepository.find({
      commitSha: commitSha,
    })
    const cov = []
    for (let i = 0; i < coverageRepositoryFindResult.length; i++) {
      const c = await this.coverageModel.findOne({
        _id: coverageRepositoryFindResult[i].relationId,
      })
      cov.push(JSON.parse(c.coverage))
    }
    return {
      fileDetail: res,
      fileCoverage: CanyonUtil.mergeCoverage(cov).find(
        (item: any) => item.path === decodeURIComponent(filePath),
      ),
    }
  }
}
