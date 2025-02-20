import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ProjectModule } from "./project/project.module";
import { CodechangeModule } from "./codechange/codechange.module";
import { SourcecodeController } from "./sourcecode/sourcecode.controller";
import { SourcecodeService } from "./sourcecode/sourcecode.service";
import { SourcecodeModule } from "./sourcecode/sourcecode.module";
import { join } from "path";
import { ServeStaticModule } from "@nestjs/serve-static";
import { CoverageModule } from "./cov/coverage.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollectModule } from "./apps/collect/collect.module";
import { CoveragediskEntity } from "./apps/collect/entity/coveragedisk.entity";
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "db/sql",
      synchronize: true,
      entities: [CoveragediskEntity],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    CollectModule,
    UserModule,
    ProjectModule,
    PrismaModule,
    CoverageModule,
    CodechangeModule,
    SourcecodeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../canyon-platform", "dist"),
      exclude: ["/graphql"], // 这样就不会触发 path-to-regexp 解析错误
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: "schema.gql",
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
  controllers: [AppController, SourcecodeController],
  providers: [SourcecodeService],
})
export class AppModule {}
