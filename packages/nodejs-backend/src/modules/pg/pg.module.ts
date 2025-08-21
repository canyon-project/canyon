import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProjectEntity } from '../../entities/project.entity';

@Module({
  imports: [MikroOrmModule.forFeature([ProjectEntity])],
  providers: [],
  exports: []
})
export class PgModule {}


