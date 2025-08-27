import { Module } from '@nestjs/common'
import { CoverageController } from './coverage.controller'
import { CoverageService } from './coverage.service'
import { SystemConfigModule } from '../system-config/system-config.module'
import { ChModule } from '../ch/ch.module'
import { OrmModule } from '../orm/orm.module'

@Module({
  imports: [ChModule, SystemConfigModule, OrmModule],
  controllers: [CoverageController],
  providers: [CoverageService],
})
export class CoverageModule {}
