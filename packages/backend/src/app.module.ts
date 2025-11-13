import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { CodeModule } from './code/code.module';
import { CollectModule } from './collect/collect.module';
import { CoverageModule } from './coverage/coverage.module';
import { HealthModule } from './health/health.module';
import { loadInfraConfiguration } from './infra-config/helper';
import { InfraConfigModule } from './infra-config/infra-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { RepoModule } from './repo/repo.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [async () => loadInfraConfiguration()],
    }),
    PrismaModule,
    InfraConfigModule,
    HealthModule,
    RepoModule,
    CollectModule,
    CodeModule,
    CoverageModule,
    TaskModule,
    ServeStaticModule.forRoot({
      rootPath: existsSync(join(__dirname, '../../frontend', 'dist'))
        ? join(__dirname, '../../frontend', 'dist')
        : join(__dirname, '..', 'client'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
