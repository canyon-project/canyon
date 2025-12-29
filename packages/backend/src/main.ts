import path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { json } from 'express';

// import { json } from 'express';

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
      limit: '200mb',
    }),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('Canyon Backend API')
    .setDescription('Canyon 代码覆盖率报告工具后端 API 文档')
    .setVersion('1.0.0')
    .addTag('coverage', '覆盖率相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 启用 Swagger UI
  SwaggerModule.setup('api', app, document);

  // 添加 JSON 格式的 API 文档接口
  app.getHttpAdapter().get('/api-json', (_req, res) => {
    res.json(document);
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
