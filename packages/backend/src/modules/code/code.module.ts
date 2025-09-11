import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CoverageEntity } from '../../entities/coverage.entity';
import { SystemConfigModule } from '../system-config/system-config.module';
import { CodeResolver } from './code.resolver';
import { CodeService } from './service/code.service';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [CoverageEntity],
    }),
    SystemConfigModule,
  ],
  providers: [CodeService, CodeResolver],
})
export class CodeModule {}
