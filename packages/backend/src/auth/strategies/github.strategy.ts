import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('INFRA.GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('INFRA.GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('INFRA.GITHUB_CALLBACK_URL'),
      scope: [configService.get<string>('INFRA.GITHUB_SCOPE')],
      // store: true,
      // store 为true的话，还不知道为什么
      // https://github.com/hoppscotch/hoppscotch/blob/main/packages/hoppscotch-backend/src/main.ts#L50
    });
  }

  validate(_: string, __: string, profile: any) {
    return {
      provider: 'github',
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profile,
    };
  }
}
