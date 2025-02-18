import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
import {CoverageMapService} from "./services/coverage-map.service";
import {CoverageSummaryMapService} from "./services/coverage-summary-map.service";
import {PrismaService} from "./prisma/prisma.service";


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
      exclude: ["/graphql"], // 这样就不会触发 path-to-regexp 解析错误
    }),
  ],
  controllers: [AppController],
  providers: [CoverageMapService,CoverageSummaryMapService,PrismaService],
})
export class AppModule {}
