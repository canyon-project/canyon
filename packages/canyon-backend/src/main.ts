import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";
import * as path from "node:path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

async function bootstrap() {
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env["PORT"] || 8080);
}

bootstrap();
