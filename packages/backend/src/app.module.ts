import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ClickHouseModule } from './clickhouse/clickhouse.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './apps/user/user.module';
import { AuthModule } from './apps/auth/auth.module';
// import { ProjectModule } from './apps/project/project.module';
import { CoverageModule } from './apps/coverage/coverage.module';
import { ProjectModule } from './apps/project/project.module';
import { SourcecodeModule } from './apps/sourcecode/sourcecode.module';

@Module({
  imports: [
    ClickHouseModule,
    PrismaModule,
    // apps
    UserModule,
    AuthModule,
    ProjectModule,
    CoverageModule,
    SourcecodeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../frontend', 'dist'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
