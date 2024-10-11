import { Module } from "@nestjs/common";
// import { CoverageController } from "./coverage.controller";
import { CoverageResolver } from "./coverage.resolver";
import {PrismaService} from "../../prisma/prisma.service";

@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    CoverageResolver,
  ],
})
export class CoverageModule {}
