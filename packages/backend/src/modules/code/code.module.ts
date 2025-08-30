import { Module } from '@nestjs/common';
import { SystemConfigModule } from '../system-config/system-config.module';
import { CodeResolver } from './code.resolver';
import { CodeService } from './code.service';

@Module({
  imports: [SystemConfigModule],
  providers: [CodeService, CodeResolver],
})
export class CodeModule {}
