import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import * as dotenv from "dotenv";
import { metricsMiddleware } from './middleware/metrics.middleware';
import path from "node:path";
// import { AppModule } from './app.module';
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});
async function bootstrap(): Promise<void> {
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  // Metrics
  app.use(metricsMiddleware);
  const config = app.get(ConfigService);
  const port = Number(config.get('PORT') ?? 8080);
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'vi/health', method: RequestMethod.GET },
      { path: 'metrics', method: RequestMethod.GET }
    ]
  });
  app.enableCors()
  await app.listen(port);
}

bootstrap();


