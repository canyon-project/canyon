import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

async function bootstrap(): Promise<void> {
  const { AppModule } = await import('./app.module.js');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = 8080

  // Serve frontend static assets from dist/public
  const publicDir = path.join(__dirname, 'public');
  app.useStaticAssets(publicDir);

  // SPA fallback: forward non-API routes to index.html
  const expressInstance = app.getHttpAdapter().getInstance?.();
  if (expressInstance && typeof expressInstance.get === 'function') {
    expressInstance.get('*', (req: any, res: any, next: any) => {
      const url: string = req?.originalUrl || req?.url || '';
      if (url.startsWith('/graphql') || url.startsWith('/api')) return next();
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }

  app.enableCors();
  await app.listen(port);
}

bootstrap();
