import { join } from 'node:path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RepoModule } from './repo/repo.module';
@Module({
  imports: [
    PrismaModule,
    RepoModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/graphql'], // 这样就不会触发 path-to-regexp 解析错误
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
