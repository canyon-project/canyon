import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const AUTH_TOKEN_COOKIE = 'auth_token';

export interface RequestWithUser extends Request {
  user: { username: string };
}

function getAuthTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp('(?:^|;\\s*)' + AUTH_TOKEN_COOKIE + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1].trim()) : null;
}

@Injectable()
export class CookieAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = getAuthTokenFromCookie(request.headers.cookie);
    if (!token) {
      throw new UnauthorizedException('缺少 auth_token cookie');
    }
    (request as RequestWithUser).user = { username: token };
    return true;
  }
}
