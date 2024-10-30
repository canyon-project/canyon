// html-body.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HtmlBody = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return new Promise((resolve, reject) => {
      let data = '';
      if (request.headers['content-type'].includes('text/plain')) {
        request.on('data', (chunk) => {
          data += chunk;
        });

        request.on('end', () => {
          resolve(data); // 返回解析后的数据
        });

        request.on('error', (err) => {
          reject(err); // 处理错误
        });
      } else {
        resolve(null); // 如果不是 text/html，则返回 null
      }
    });
  },
);
