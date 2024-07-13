// import {PrismaModule} from "../prisma/prisma.module";
import {Module} from "@nestjs/common";
import {SynsService} from "./syns.service";
import {PrismaService} from "../prisma/prisma.service";
import {CoverageDataAdapterService} from "../coverage/services/common/coverage-data-adapter.service";
import {MongooseModule} from "@nestjs/mongoose";
import {CoverageData, CoverageDataSchema} from "../coverage/schemas/coverage-data.schema";
import {CoverageLog, CoverageLogSchema} from "../coverage/schemas/coverage-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CoverageData.name,
        schema: CoverageDataSchema,
        collection: 'canyon_coverage_data',
      },
      {
        name: CoverageLog.name,
        schema: CoverageLogSchema,
        collection: 'canyon_coverage_log',
      }
    ]),
  ],
  controllers: [],
  providers: [
    PrismaService,
    SynsService,
    CoverageDataAdapterService
  ],
})
export class TaskModule {}
