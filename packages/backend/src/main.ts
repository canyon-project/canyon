import * as path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { json } from 'express';

// dotenv.config({
//   path: path.resolve(__dirname, '../../../.env'),
// });

dotenv.config({
  path: [
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../.env'),
  ],
});

async function bootstrap() {
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(
    json({
      limit: '200mb',
    }),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    origin: configService.get('INFRA.WHITELISTED_ORIGINS').split(','),
    credentials: true,
  });
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
