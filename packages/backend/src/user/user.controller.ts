import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/public.decorator';

@Controller('api/user')
export class UserController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: any) {
    const userId = req.user?.userId as string;
    if (!userId) return null;
    return this.authService.me(userId);
  }

  @Get('logout')
  @Public()
  async logout(@Res() res: Response) {
    const cookieName = process.env.AUTH_COOKIE_NAME || 'auth_token';
    res.clearCookie(cookieName, { path: '/' });
    return res.status(200).send({ ok: true });
  }

  @Post('login')
  @Public()
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { email, password } = body || ({} as any);
    return this.authService.loginWithEmailPassword(email, password, res);
  }
}
