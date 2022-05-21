import axios from 'axios'
import { Inject } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from '../../auth/entities/user.entity'
import service from './request'

// gitlab的所有服务
const gitlabApplicationUri = global.conf.gitlab.application.uri
export class GitlabService {
  constructor(
    @Inject('user_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
  // todo 这里是否有重构的可能性？改成直接传一个ids，不知道gitlab有没有api接口
  async repoList({ currentUser, thRepoIds }) {
    const token = await this.userRepository
      .findOne({ id: currentUser })
      .then((res) => res.thAccessToken)
    return await Promise.all(
      thRepoIds.map((item) => {
        return service.get(`${gitlabApplicationUri}/api/v4/projects/${item}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }),
    )
  }

  //检索一个仓库 thRepoId 可以是id也可以是仓库名
  async retrieveARepo({ currentUser, thRepoId }) {
    const token = await this.userRepository
      .findOne({ id: currentUser })
      .then((res) => res.thAccessToken)
    return await service.get(
      `${gitlabApplicationUri}/api/v4/projects/${encodeURIComponent(thRepoId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  async getASingleCommit({ currentUser, thRepoId, commitSha }) {
    console.log({ currentUser, thRepoId, commitSha })
    const token = await this.userRepository
      .findOne({ id: currentUser })
      .then((res) => res.thAccessToken)
    return await axios
      .get(
        `${gitlabApplicationUri}/api/v4/projects/${encodeURIComponent(
          thRepoId,
        )}/repository/commits/${commitSha}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then((res) => {
        return res.data
      })
      .catch((err) => {
        console.log(err, '错位')
      })
  }
}
