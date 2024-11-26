import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as v8 from 'v8';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
v8.takeCoverage();
