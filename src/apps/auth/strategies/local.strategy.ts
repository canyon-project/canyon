import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    })
  }

  async validate(username: string, password: string): Promise<any> {
    // console.log({ username, password, LocalStrategy: 'LocalStrategy' });
    console.log(
      'LocalStrategy.validate 第一步：从鉴权服务拿到username password，实际已经被转换过了',
      username,
      password,
    )
    // 第一步：从鉴权服务拿到username password，实际已经被转换过了
    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
