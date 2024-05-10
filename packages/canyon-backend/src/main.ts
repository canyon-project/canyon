import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

async function bootstrap() {
  // 获取启动变量，动态修改.env文件
  const CFG = process.env.CFG;
  if (CFG) {
    console.log('CFG', CFG);
    fs.writeFileSync('./.env', CFG, 'utf8');
  }
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
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
