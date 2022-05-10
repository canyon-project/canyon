import { Module } from '@nestjs/common'
import { databaseProviders, mongodbProviders } from './database.providers'

@Module({
  providers: [...databaseProviders, ...mongodbProviders],
  exports: [...databaseProviders, ...mongodbProviders],
})
export class DatabaseModule {}
