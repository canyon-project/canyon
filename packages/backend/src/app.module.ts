import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CodeModule } from './code/code.module';
import { CollectModule } from './collect/collect.module';
import { CoverageModule } from './coverage/coverage.module';
import { HealthModule } from './health/health.module';
import { loadInfraConfiguration } from './infra-config/helper';
import { ProviderModule } from './provider/provider.module';
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
    ProviderModule,
    ServeStaticModule.forRoot({
      rootPath: existsSync(join(__dirname, '../../frontend', 'dist'))
        ? join(__dirname, '../../frontend', 'dist')
        : join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
