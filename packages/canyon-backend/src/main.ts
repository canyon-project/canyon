import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import * as fs from 'node:fs';
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});
async function bootstrap() {
  // 获取启动变量，动态修改.env文件
  const DATABASE_URL = process.env.DATABASE_URL;
  if (DATABASE_URL) {
    fs.writeFileSync('./.env', `DATABASE_URL=${DATABASE_URL}`, 'utf8');
  }
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    json({
      limit: '100mb',
    }),
  );
  app.enableCors();
  await app.listen(8080);
}
bootstrap();
