import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {ConfigEntity} from "../../entities/config.entity";

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [ConfigEntity],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
