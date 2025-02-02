import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as path from "node:path";
import { json } from "express";
import * as history from "connect-history-api-fallback";
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

async function bootstrap() {
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);
  // 使用 history API fallback 解决前端 history 模式 404 问题
  app.use(history());
  app.use(
    json({
      limit: "50mb",
    }),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env["PORT"] || 8080);
}

bootstrap();
