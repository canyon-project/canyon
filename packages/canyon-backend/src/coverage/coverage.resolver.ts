import { Query, Resolver } from "@nestjs/graphql";
import { GetCoverageLogsService } from "./services/get-coverage-logs.service";
import { GetCoverageLogsPageModel } from "./models/get-coverage-logs-page.model";

@Resolver(() => "Coverage")
export class CoverageResolver {
  constructor(
    private readonly getCoverageLogsService: GetCoverageLogsService,
  ) {}
  @Query(() => GetCoverageLogsPageModel, {
    description: "查询覆盖率上报日志",
  })
  getCoverageLogs(): Promise<GetCoverageLogsPageModel> {
    return this.getCoverageLogsService.invoke();
  }
}
