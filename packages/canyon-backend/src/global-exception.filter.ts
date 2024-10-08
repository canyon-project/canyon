import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { logger } from "./logger";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    // 1.在控制台打印错误，便于调试
    console.error(exception);

    // 2.记录日志
    logger({
      type: "error",
      title: String(exception),
      message: `exception:${String(
        exception instanceof HttpException
          ? exception.getResponse()
          : "Internal server error",
      )}|url:${request.url}`,
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : "Internal server error",
    });
  }
}
