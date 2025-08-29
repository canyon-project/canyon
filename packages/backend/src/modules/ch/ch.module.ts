import { Module } from '@nestjs/common'
import { ChService } from './ch.service'

@Module({
  providers: [ChService],
  exports: [ChService],
})
export class ChModule {}
