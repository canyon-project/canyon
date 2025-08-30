import { Global, Module } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';

@Global()
@Module({
  providers: [SystemConfigService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
