import { NestFactory } from "@nestjs/core";
import { json } from "express";
import { ValidationPipe } from "@nestjs/common";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { GlobalExceptionFilter } from "./filter/global-exception.filter";
// 勿删
console.log(fs);
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

async function bootstrap() {
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // 使用全局过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(
    json({
      limit: "50mb",
    }),
  );
  app.enableCors();
  await app.listen(process.env["PORT"] || 8080);
}
bootstrap();
