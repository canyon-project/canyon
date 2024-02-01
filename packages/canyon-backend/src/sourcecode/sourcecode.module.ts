import { Module } from '@nestjs/common';
import {SourcecodeController} from "./sourcecode.controller";
import {PrismaService} from "../prisma/prisma.service";
import {SourcecodeService} from "./sourcecode.service";
// import { CodechangeController } from '../codechange/codechange.controller';

@Module({
  controllers: [SourcecodeController],
  providers: [
    SourcecodeService,
    PrismaService,
  ],
})
export class SourcecodeModule {}
