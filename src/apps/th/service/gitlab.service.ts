import axios from 'axios'
import { Inject } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from '../../auth/entities/user.entity'
import service from './request'

export class GitlabService {
  constructor(
    @Inject('user_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
  async repoList({ currentUser, repos }) {
    const token = await this.userRepository
      .findOne({ id: currentUser })
      .then((res) => res.thAccessToken)
    return await Promise.all(
      repos.map((item) => {
        return service.get(
          `http://gitlab.rico.org.cn/api/v4/projects/${item.thRepoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      }),
    )
  }

  async retrieveARepo({ currentUser, thRepoId }) {
    const token = await this.userRepository
      .findOne({ id: currentUser })
      .then((res) => res.thAccessToken)
    return await service.get(
      `http://gitlab.rico.org.cn/api/v4/projects/${encodeURIComponent(
        thRepoId,
      )}`,
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
        `http://gitlab.rico.org.cn/api/v4/projects/${encodeURIComponent(
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
      }).catch(err=>{
        console.log(err,'错位')
      })
  }
}
