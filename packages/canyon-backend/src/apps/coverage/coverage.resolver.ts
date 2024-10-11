import { Query, Resolver } from "@nestjs/graphql";
// import { GetCoverageLogsService } from "./services/get-coverage-logs.service";
import { GetCoverageLogsPageModel } from "./models/get-coverage-logs-page.model";
import {PrismaService} from "../../prisma/prisma.service";

@Resolver(() => "Coverage")
export class CoverageResolver {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  @Query(() => GetCoverageLogsPageModel, {
    description: "查询覆盖率上报日志",
  })
  async getCoverageLogs(): Promise<GetCoverageLogsPageModel> {
    const users = await this.prisma.user.count();
    return {
      data: [{
        id: "1",
      }],
      total: users,
    }
  }
}
