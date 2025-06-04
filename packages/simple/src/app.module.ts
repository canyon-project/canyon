import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
// import { ClickHouseModule } from './clickhouse/clickhouse.module';
// import { PrismaModule } from './prisma/prisma.module';
// import { UserModule } from './apps/user/user.module';
// import { AuthModule } from './apps/auth/auth.module';
// import { ProjectModule } from './apps/project/project.module';
import { CoverageModule } from './apps/coverage/coverage.module';
// import { ProjectModule } from './apps/project/project.module';
// import { SourcecodeModule } from './apps/sourcecode/sourcecode.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleCoverage } from './apps/coverage/entities/simple-coverage.entity';
import { CodeModule } from './apps/code/code.module';
import { SimpleGitProvider } from './apps/code/entities/simple-git-provider.entity';

const DATABASE_URL = process.env.DATABASE_URL;
console.log(DATABASE_URL, 'DATABASE_URL');
// @ts-ignore
const [, username, password, host, port, database] = [
  '',
  'postgres',
  '123456',
  'localhost',
  5432,
  'postgres'
];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: host,
      port: port,
      username: username,
      password: password,
      database: database,
      entities: [SimpleCoverage, SimpleGitProvider],
    }),
    // ClickHouseModule,
    // PrismaModule,
    // apps
    // UserModule,
    // AuthModule,
    // ProjectModule,
    CoverageModule,
    CodeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
