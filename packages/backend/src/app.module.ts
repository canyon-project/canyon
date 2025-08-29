import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import { ChModule } from './modules/ch/ch.module'
import { CodeModule } from './modules/code/code.module'
import { SystemConfigModule } from './modules/system-config/system-config.module'
import { RepoModule } from './modules/repo/repo.module'
import { CoverageModule } from './modules/coverage/coverage.module'
import { MikroOrmModule } from '@mikro-orm/nestjs'

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
})
export class AppModule {}
