import { Module } from '@nestjs/common'
import { CodeService } from './code.service'
import { SystemConfigModule } from '../system-config/system-config.module'
import { CodeResolver } from './code.resolver'

@Module({
  imports: [SystemConfigModule],
  providers: [CodeService, CodeResolver],
})
export class CodeModule {}
