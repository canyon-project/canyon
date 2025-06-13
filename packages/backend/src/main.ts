import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'node:path';
import { json } from 'express';
import * as process from 'node:process';
dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

async function bootstrap() {
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  app.use(
    json({
      limit: '50mb',
    }),
  );
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('CanyonJS API')
    .setDescription('CanyonJS API Documentation')
    .setVersion('2.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document,{
    jsonDocumentUrl: 'swagger/json',
  });
  await app.listen(process.env['PORT'] || 8080);
}

bootstrap();
