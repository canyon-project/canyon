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

  // GitLab
  @Get('gitlab')
  @Public()
  @UseGuards(AuthGuard('gitlab'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async gitlabAuth() {}

  @Get('gitlab/callback')
  @Public()
  @UseGuards(AuthGuard('gitlab'))
  async gitlabCallback(@Req() req: Request, @Res() res: Response) {
    return this.authService.handleOAuthRedirect(req, res);
  }
}
