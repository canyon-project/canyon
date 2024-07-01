import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CoverageModule } from './coverage/coverage.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ProjectModule } from './project/project.module';
import { CodechangeModule } from './codechange/codechange.module';
import { SourcecodeController } from './sourcecode/sourcecode.controller';
import { SourcecodeService } from './sourcecode/sourcecode.service';
import { SourcecodeModule } from './sourcecode/sourcecode.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './upload/upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoveragediskEntity } from './coverage/entity/coveragedisk.entity';
// import * as path from 'node:path';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   envFilePath: path.resolve(__dirname, '../../../.env'),
    // }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db/sql',
      synchronize: true,
      entities: [CoveragediskEntity],
    }),
    ScheduleModule.forRoot(),
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
    }),
  ],
  controllers: [AppController, SourcecodeController],
  providers: [AppService, SourcecodeService],
})
export class AppModule {}
