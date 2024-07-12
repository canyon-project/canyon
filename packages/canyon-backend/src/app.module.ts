import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { CoverageModule } from './coverage/coverage.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    PrismaModule,
    CoverageModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../canyon-platform', 'dist'),
      exclude: ['/graphql/(.*)'],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
