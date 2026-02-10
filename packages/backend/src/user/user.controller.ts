import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { CookieAuthGuard } from './guards/cookie-auth.guard';
import { UserGetCurrentUserService } from './services/user-get-current-user.service';

@ApiTags('user')
@Controller('api/user')
@UseGuards(CookieAuthGuard)
export class UserController {
  constructor(
    private readonly userGetCurrentUserService: UserGetCurrentUserService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户（需鉴权 cookie auth_token）' })
  @ApiResponse({ status: 200, description: '返回用户信息' })
  @ApiResponse({ status: 401, description: '未登录或 cookie 无效' })
  async getCurrentUser(@CurrentUser() user: { username: string }) {
    const profile =
      await this.userGetCurrentUserService.invoke(user.username);
    return {
      username: user.username,
      nickname: profile.nickname,
      email: profile.email,
      avatar: profile.avatar,
    };
  }
}
