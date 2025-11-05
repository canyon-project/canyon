import * as path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
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
  app.use(
    json({
      limit: '50mb',
    }),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  const allowOrigins = ['http://localhost:8000', 'https://app.canyonjs.io'];
  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      const matched = allowOrigins.some((o) => requestOrigin === o);
      callback(null, matched);
    },
    credentials: true,
  });
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
