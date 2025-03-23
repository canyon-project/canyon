import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {join} from "path";
import { ServeStaticModule } from "@nestjs/serve-static";
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../frontend", "dist"),
      exclude: ["/graphql"], // 这样就不会触发 path-to-regexp 解析错误
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
