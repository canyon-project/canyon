import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CodeController } from './code.controller';
// import { CodeResolver } from './code.resolver';
import { CodeService } from './service/code.service';

@Module({
  imports: [PrismaModule],
  controllers: [CodeController],
  providers: [CodeService],
})
export class CodeModule {}
