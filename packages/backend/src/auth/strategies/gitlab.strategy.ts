import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-gitlab2';

@Injectable()
export class GitlabStrategy extends PassportStrategy(Strategy, 'gitlab') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('INFRA.GITLAB_CLIENT_ID'),
      clientSecret: configService.get<string>('INFRA.GITLAB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('INFRA.GITLAB_CALLBACK_URL'),
      scope: configService.get<string>('INFRA.GITLAB_SCOPE'),
      baseURL:
        configService.get<string>('INFRA.GITLAB_BASE_URL') ||
        'https://gitlab.com',
    });
  }

  validate(_: string, __: string, profile: any) {
    return {
      provider: 'gitlab',
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profile,
    };
  }
}
