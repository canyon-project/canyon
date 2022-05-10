import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import axios from 'axios'
import { getRangeRandomNumber } from '../../utils'
import { sendPassword, sendSignUp } from '../../common/mail/send-mail'
import { AuthService } from './auth.service'

@Injectable()
export class UserService {
  constructor(
    @Inject('user_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}
  myInfo(currentUser: number) {
    return this.userRepository.findOne({ id: currentUser })
  }

  // 登陆接口！！！
  async passwordLogin({ username, password }) {
    const user = await this.userRepository.find({
      password,
      username,
      active: 1,
    })
    if (user.length > 0) {
      return user[0]
    } else {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '账号密码错误',
        },
        HttpStatus.FORBIDDEN,
      )
    }
  }

  // 检查是否存在邮箱，如果没有就发邮件
  async checkEmailType({ email }) {
    const code = String(getRangeRandomNumber(1000, 9999))
    if (await this.userRepository.findOne({ username: email, active: 1 })) {
      return {
        hasAccount: true,
      }
    } else {
      if (await this.userRepository.findOne({ username: email, active: 0 })) {
        sendSignUp({
          receivers: [email],
          bodyContentParams: { code: code },
        }).then((res) => {
          console.log(res)
        })
        return this.userRepository.update(
          { username: email },
          {
            password: code,
          },
        )
      } else {
        sendSignUp({
          receivers: [email],
          bodyContentParams: { code: code },
        }).then((res) => {
          console.log(res)
        })
        return this.userRepository.insert({
          username: email,
          email: email,
          password: code,
        })
      }
    }
  }

  // 把发过去的邮件检查一下
  async sendTemporaryPassword({ email, password }) {
    const userRepositoryFindOneByUsernameAndActivateTrue =
      await this.userRepository.findOne({ username: email, active: 1 })
    if (userRepositoryFindOneByUsernameAndActivateTrue) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '该邮箱已被激活',
        },
        HttpStatus.FORBIDDEN,
      )
    }
    const userRepositoryFindOneByUsernameAndPasswordActivateFalse =
      await this.userRepository.findOne({
        username: email,
        password: password,
        active: 0,
      })
    if (!userRepositoryFindOneByUsernameAndPasswordActivateFalse) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '密码不对',
        },
        HttpStatus.FORBIDDEN,
      )
    }

    await this.userRepository.update(
      { username: email, password: password },
      { active: 1 },
    )
    return axios
      .post(`${global.conf.base.url}/auth/login`, {
        username: email,
        password: password,
      })
      .then((res) => res.data)
  }

  async getActivatedAccountPassword({ email }) {
    const userRepositoryFindOneByUsernameAndActivateTrue =
      await this.userRepository.findOne({ username: email, active: 1 })
    if (!userRepositoryFindOneByUsernameAndActivateTrue) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '没找到账号',
        },
        HttpStatus.FORBIDDEN,
      )
    }
    sendPassword({
      receivers: [email],
      bodyContentParams: {
        code: userRepositoryFindOneByUsernameAndActivateTrue.password,
      },
    }).then((res) => {
      console.log(res)
    })
    return { msg: '发送成功' }
  }

  async changePassword(currentUser, { oldPassword, newPassword }) {
    const currentUserInfo = await this.userRepository.findOne({
      id: currentUser,
    })
    if (currentUserInfo.password === oldPassword) {
      return this.userRepository.update(
        { id: currentUser },
        { password: newPassword },
      )
    } else {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: '旧密码错误',
        },
        HttpStatus.FORBIDDEN,
      )
    }
  }
}
