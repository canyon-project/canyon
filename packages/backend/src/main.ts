import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('Canyon Backend API')
    .setDescription('Canyon 代码覆盖率报告工具后端 API 文档')
    .setVersion('1.0.0')
    .addTag('coverage', '覆盖率相关接口')
    .addTag('reports', '报告相关接口')
    .addTag('projects', '项目管理接口')
    .addServer('http://localhost:8080', '开发环境')
    .addServer('https://api.canyon.dev', '生产环境')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 启用 Swagger UI
  SwaggerModule.setup('api', app, document);
  
  // 添加 JSON 格式的 API 文档接口
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });
  
  console.log('📖 Swagger UI 可访问: http://localhost:8080/api');
  console.log('📄 Swagger JSON 可访问: http://localhost:8080/api-json');

  await app.listen(process.env.PORT ?? 8080);
  console.log('🚀 Backend 服务已启动: http://localhost:8080');
}
bootstrap();
