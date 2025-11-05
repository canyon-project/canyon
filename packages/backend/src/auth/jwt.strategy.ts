import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

function cookieExtractor(req: any): string | null {
  if (req && req.cookies) {
    return req.cookies[process.env.AUTH_COOKIE_NAME || 'auth_token'] || null;
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get('INFRA.JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    return { userId: payload.sub };
  }
}
