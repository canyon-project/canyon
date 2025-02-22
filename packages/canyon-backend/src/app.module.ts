import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ProjectModule} from "./apps/project/project.module";
import {PrismaModule} from "./prisma/prisma.module";
import {join} from "path";
import {ServeStaticModule} from "@nestjs/serve-static";
import {GraphQLModule} from "@nestjs/graphql";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';


@Module({
  imports: [
    PrismaModule,
    // apps
    ProjectModule,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
