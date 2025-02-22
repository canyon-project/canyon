import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
