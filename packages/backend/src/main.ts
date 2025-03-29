import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { json } from 'express';
import * as process from "node:process";
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

process.env.DATABASE_URL =process.env.PAAS_ENV? atob(
  `cG9zdGdyZXM6Ly91YXBwX2NhbnlvbjpPVGswT0RrMll6QGNhbnlvbi5wZy5kYi51YXQucWEubnQuY3RyaXBjb3JwLmNvbTo1NTc3Ny9jYW55b25kYj9zY2hlbWE9cHVibGlj`,
):'postgres://postgres:123456@localhost:5432/postgres';

async function bootstrap() {
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  app.use(
    json({
      limit: '50mb',
    }),
  );
  app.enableCors();
  await app.listen(process.env['PORT'] || 8080);
}

bootstrap();
