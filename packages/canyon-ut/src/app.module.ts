import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import {ServeStaticModule} from "@nestjs/serve-static";
import {join} from "path";
import {CoverageMapService} from "./services/coverage-map.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CoverageUtEntity} from "./entity/coverage-ut.entity";

function parseDatabaseUrl(url) {
  const match = url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)\?schema=(.*)/);
  if (match) {
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4]),
      database: match[5],
    };
  } else {
    throw new Error('Invalid DATABASE_URL format');
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
const config = parseDatabaseUrl(DATABASE_URL);


console.log(config)

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: config.host,
      port: config.port,
      username: config.user,
      password: config.password,
      database: config.database,
      // synchronize: true,
      entities: [CoverageUtEntity],
    }),
    TypeOrmModule.forFeature([CoverageUtEntity]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
      exclude: ["/graphql"], // 这样就不会触发 path-to-regexp 解析错误
    }),
  ],
  controllers: [AppController],
  providers: [CoverageMapService],
})
export class AppModule {}
