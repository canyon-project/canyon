import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeModule } from './code/code.module';
import { CollectModule } from './collect/collect.module';
import { CoverageModule } from './coverage/coverage.module';
import { HealthModule } from './health/health.module';
import { loadInfraConfiguration } from './infra-config/helper';
import { PrismaModule } from './prisma/prisma.module';
import { RepoModule } from './repo/repo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [async () => loadInfraConfiguration()],
    }),
    HealthModule,
    PrismaModule,
    CollectModule,
    CoverageModule,
    RepoModule,
    CodeModule,
    ServeStaticModule.forRoot({
      rootPath: existsSync(join(__dirname, '../../frontend', 'dist'))
        ? join(__dirname, '../../frontend', 'dist')
        : join(__dirname, '..', 'public'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
