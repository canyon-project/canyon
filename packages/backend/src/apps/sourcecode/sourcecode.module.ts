import { Module } from '@nestjs/common';
import { SourcecodeController } from './sourcecode.controller';
// import { PrismaService } from '../prisma/prisma.service';
import { SourcecodeService } from './sourcecode.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SourcecodeController],
  providers: [SourcecodeService, PrismaService],
})
export class SourcecodeModule {}
