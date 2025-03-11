import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ProjectModule } from './apps/project/project.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { UserModule } from './apps/user/user.module';
import {AuthModule} from "./apps/auth/auth.module";

@Module({
  imports: [
    PrismaModule,
    // apps
    UserModule,
    AuthModule,
    ProjectModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../frontend', 'dist'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
