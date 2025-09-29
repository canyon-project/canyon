import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { ChModule } from './modules/ch/ch.module';
import { ConfigModule } from './modules/config/config.module';
import { CoverageModule } from './modules/coverage/coverage.module';
// import { CodeModule } from './modules/code/code.module';
// import { CoverageModule } from './modules/coverage/coverage.module';
import { RepoModule } from './modules/repo/repo.module';
// import { ConfigModule } from './modules/system-config/system-config.module';
import { JSONScalar } from './scalars/json.scalar';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    ChModule,
    CoverageModule,
    RepoModule,
    // CodeModule,
    ConfigModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
    }),
  ],
  controllers: [AppController],
  providers: [JSONScalar],
})
export class AppModule {}
