import { Module } from '@nestjs/common';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageController } from './coverage.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CoverageService } from "./services/coverage.service";
@Module({
  imports: [],
  controllers: [CoverageController],
  providers: [CoverageClientService, PrismaService,CoverageService],
})
export class CoverageModule {}
