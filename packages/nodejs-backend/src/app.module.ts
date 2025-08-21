import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChModule } from './modules/ch/ch.module';
import { HealthController } from './controllers/health.controller';
import { CoverageModule } from './modules/coverage/coverage.module';
import { RepoModule } from './modules/repo/repo.module';
import { CodeModule } from './modules/code/code.module';
import { RootController } from './controllers/root.controller';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import {OrmModule} from "./modules/orm/orm.module";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OrmModule,
    ChModule,
    CoverageModule,
    RepoModule,
    CodeModule,
    SystemConfigModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: "schema.gql",
      driver: ApolloDriver,
    }),
  ],
  controllers: [RootController, HealthController]
})
export class AppModule {}


