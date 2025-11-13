import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    // GraphQL 请求上下文
    const gqlCtx = GqlExecutionContext.create(context);
    const req = gqlCtx.getContext<{ req: any }>()?.req;
    if (req) return req;
    // Fallback: HTTP 路由
    return context.switchToHttp().getRequest();
  }
}
