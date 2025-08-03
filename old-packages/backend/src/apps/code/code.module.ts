import { Module } from '@nestjs/common';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CodeController],
  providers: [CodeService, PrismaService],
})
export class CodeModule {}
