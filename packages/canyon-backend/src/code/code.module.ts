import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CodeService } from "./code.service";
import {Codechange2Service} from "./codechange2.service";
import {CodeController} from "./code.controller";

@Module({
  controllers: [CodeController],
  providers: [CodeService, PrismaService,Codechange2Service],
})
export class CodeModule {}
