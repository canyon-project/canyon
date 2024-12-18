import { Module } from "@nestjs/common";
import { CollectController } from "./collect.controller";
import { CoverageClientService } from "./services/coverage-client.service";
import { CoverageMapClientService } from "./services/coverage-map-client.service";
import { CoveragediskService } from "./services/core/coveragedisk.service";
import { ConsumerCoverageService } from "./services/core/consumer-coverage.service";
import { CoveragediskEntity } from "./entity/coveragedisk.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [TypeOrmModule.forFeature([CoveragediskEntity])],
  controllers: [CollectController],
  providers: [
    PrismaService,
    CoverageClientService,
    CoverageMapClientService,
    ConsumerCoverageService,
    CoveragediskService,
  ],
})
export class CollectModule {
  constructor(
    private readonly consumerCoverageService: ConsumerCoverageService,
  ) {
    this.consumerCoverageService.invoke();
  }
}
