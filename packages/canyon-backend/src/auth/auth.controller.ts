import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OauthgitproviderService } from './services/oauthgitprovider.service';
interface Oauthgitproviderparams {
  code: string;
  type: string; //github
}
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthgitproviderService: OauthgitproviderService,
  ) {}

  @Post('/api/oauth/token')
  async oauthToken(@Body() params: any) {
    return this.authService.oauthToken(params);
  }

  @Post('/api/oauth/git/provider')
  async oauthgitprovider(@Body() params: Oauthgitproviderparams) {
    // 通过code兑换到用户信息后，写入git表，主要保存token
    return this.oauthgitproviderService.invoke(params);
  }

  @Post('/api/login')
  async passwordLogin(@Body() reqBody: { username: string; password: string }) {
    return this.authService.passwordLogin(reqBody);
  }
}
