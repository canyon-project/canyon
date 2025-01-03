import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
// import { IS_PUBLIC_KEY } from "../../decorators/public.decorator";
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    constructor(private reflector: Reflector) {
        super();
    }
    canActivate(context: ExecutionContext): any {
        const request = context.switchToHttp().getRequest();
        // 获取请求体
        const requestBody = request.body;
        if (Object.keys(requestBody).length === 0) {
            return true;
        }
        return super.canActivate(context);
    }
}
