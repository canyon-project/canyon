import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { ChModule } from './modules/ch/ch.module';
import { CodeModule } from './modules/code/code.module';
import { CoverageModule } from './modules/coverage/coverage.module';
import { RepoModule } from './modules/repo/repo.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { JSONScalar } from './scalars/json.scalar';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(),
    ChModule,
    CoverageModule,
    RepoModule,
    CodeModule,
    SystemConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
    }),
  ],
  controllers: [AppController],
  providers: [JSONScalar],
})
export class AppModule {}
