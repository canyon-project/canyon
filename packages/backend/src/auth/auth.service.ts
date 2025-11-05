import { randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private extractEmail(oauthUser: any): string | undefined {
    const emails = oauthUser?.emails as Array<{ value: string }> | undefined;
    if (Array.isArray(emails) && emails.length > 0) return emails[0]?.value;
    return undefined;
  }

  private extractName(oauthUser: any): string | undefined {
    return oauthUser?.displayName || oauthUser?.username || undefined;
  }

  private extractAvatar(oauthUser: any): string | undefined {
    const photos = oauthUser?.photos as Array<{ value: string }> | undefined;
    if (Array.isArray(photos) && photos.length > 0) return photos[0]?.value;
    return undefined;
  }

  async handleOAuthRedirect(req: any, res: Response) {
    const oauthUser = (req as any).user as any;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const target = new URL('/', frontendUrl);

    let boundUserId: string | undefined;
    let provider: string | undefined;

    if (oauthUser) {
      provider = oauthUser.provider;
      let email = this.extractEmail(oauthUser);
      const nickname = this.extractName(oauthUser) || '';
      const avatar = this.extractAvatar(oauthUser) || '';

      if (!email) {
        const local = `${provider || 'oauth'}-${oauthUser?.id || randomUUID()}`;
        email = `${local}@oauth.local`;
      }

      const existing = await this.prisma.user.findFirst({ where: { email } });
      if (existing) {
        boundUserId = existing.id;
        const nextNickname = nickname || existing.nickname;
        const nextAvatar = avatar || existing.avatar;
        if (
          nextNickname !== existing.nickname ||
          nextAvatar !== existing.avatar
        ) {
          await this.prisma.user.update({
            where: { id: existing.id },
            data: { nickname: nextNickname, avatar: nextAvatar },
          });
        }
      } else {
        const newId = randomUUID();
        const randomPassword = randomBytes(24).toString('hex');
        const favor = '';
        const created = await this.prisma.user.create({
          data: {
            id: newId,
            email,
            password: randomPassword,
            nickname: nickname || email.split('@')[0],
            avatar,
            favor,
          },
        });
        boundUserId = created.id;
      }

      if (boundUserId) {
        const token = this.jwtService.sign({ sub: boundUserId });
        const cookieName = process.env.AUTH_COOKIE_NAME || 'auth_token';
        const isProd = process.env.NODE_ENV === 'production';
        const cookieSameSite = (process.env.AUTH_COOKIE_SAMESITE ||
          (isProd ? 'none' : 'lax')) as 'lax' | 'none' | 'strict';
        const cookieSecure = (
          process.env.AUTH_COOKIE_SECURE
            ? process.env.AUTH_COOKIE_SECURE === 'true'
            : isProd
        ) as boolean;
        res.cookie(cookieName, token, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: cookieSameSite,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });
      }
    }

    return res.redirect(target.toString());
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
