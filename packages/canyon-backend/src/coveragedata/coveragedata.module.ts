import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CoveragedataController } from './coveragedata.controller';
@Module({
  imports: [PrismaModule],
  controllers: [CoveragedataController],
  providers: [],
  exports: [],
})
export class CoveragedataModule {}
