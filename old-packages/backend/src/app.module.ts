import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ClickHouseModule } from './clickhouse/clickhouse.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './apps/user/user.module';
import { AuthModule } from './apps/auth/auth.module';
import { CoverageModule } from './apps/coverage/coverage.module';
import { RepoModule } from './apps/repo/repo.module';
import { CodeModule } from './apps/code/code.module';

@Module({
  imports: [
    ClickHouseModule,
    PrismaModule,
    UserModule,
    AuthModule,
    RepoModule,
    CoverageModule,
    CodeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../frontend', 'dist'),
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
