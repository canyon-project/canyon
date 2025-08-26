import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { AppService } from './app.service'
import { HelloResolver } from './hello.resolver'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: 'schema.gql',
      driver: ApolloDriver,
    }),
  ],
  controllers: [],
  providers: [AppService, HelloResolver],
})
export class AppModule {}
