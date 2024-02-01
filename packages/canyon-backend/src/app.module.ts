import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CoverageModule } from './coverage/coverage.module';
// import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ProjectModule } from './project/project.module';
import { TasksModule } from './tasks/tasks.module';
import { CodechangeModule } from './codechange/codechange.module';
import { SourcecodeController } from './sourcecode/sourcecode.controller';
import { SourcecodeService } from './sourcecode/sourcecode.service';
import { SourcecodeModule } from './sourcecode/sourcecode.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './upload/upload.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    // TasksModule, // 任务模块(这是标记，勿动！)
    AuthModule,
    UserModule,
    ProjectModule,
    PrismaModule,
    CoverageModule,
    CodechangeModule,
    SourcecodeModule,
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../canyon-platform', 'dist'),
      exclude: ['/graphql/(.*)'],
    }),
    ConfigModule.forRoot({
      envFilePath: './.[env]',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
    }),
    // TasksModule,
  ],
  controllers: [AppController, SourcecodeController],
  providers: [AppService, SourcecodeService],
})
export class AppModule {}
