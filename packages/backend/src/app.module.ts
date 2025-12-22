import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectModule } from './collect/collect.module';
import {PrismaModule} from "./prisma/prisma.module";
import {CoverageModule} from "./coverage/coverage.module";

@Module({
  imports: [
    PrismaModule,
    CollectModule,
    CoverageModule,
    ServeStaticModule.forRoot({
      rootPath: existsSync(join(__dirname, '../../frontend', 'dist'))
        ? join(__dirname, '../../frontend', 'dist')
        : join(__dirname, '..', 'public'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
