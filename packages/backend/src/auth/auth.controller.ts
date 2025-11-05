import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // GitHub
  @Get('github')
  @Public()
  @UseGuards(AuthGuard('github'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async githubAuth() {}

  @Get('github/callback')
  @Public()
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    return this.authService.handleOAuthRedirect(req, res);
  }

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
}
