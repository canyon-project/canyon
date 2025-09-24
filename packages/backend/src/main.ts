import path from 'node:path';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

async function bootstrap(): Promise<void> {
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 8080);

  app.enableCors();
  await app.listen(port);
}

bootstrap();
