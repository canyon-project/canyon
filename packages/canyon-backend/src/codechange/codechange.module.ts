import { Module } from "@nestjs/common";
import { CodechangeService } from "./codechange.service";
import { CodechangeController } from "./codechange.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [CodechangeController],
  providers: [CodechangeService, PrismaService],
})
export class CodechangeModule {}
