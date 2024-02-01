import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/api/oauth/token')
  async oauthToken(@Body() params: any) {
    return this.authService.oauthToken(params);
  }

  @Post('/api/login')
  async passwordLogin(@Body() reqBody: { username: string; password: string }) {
    return this.authService.passwordLogin(reqBody);
  }
}
