import * as path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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
  app.enableCors();
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
