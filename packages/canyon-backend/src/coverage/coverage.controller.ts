import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoverageService } from './services/coverage.service';
@Controller()
export class CoverageController {
  constructor(
    private readonly coverageClientService: CoverageClientService,
    private readonly coverageService: CoverageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('coverage/client')
  async coverageClient(
    @Body() coverageClientDto: CoverageClientDto,
    @Request() req: { user: { id } },
  ): Promise<any> {
    return this.coverageClientService.invoke(req.user.id, coverageClientDto);
  }

  // 以下是给客户端用的
  // @Get('api/coverage/summary/map')
  // async coverageSummary(@Query() query): Promise<any> {
  //   const { projectID, sha, reportID } = query;
  //   return this.coverageService.getCoverageSummaryMap(projectID, sha, reportID);
  // }

  @Get('api/coverage/map')
  async coverageMap(@Query() query): Promise<any> {
    const { projectID, sha, reportID, filepath } = query;
    return this.coverageService.getCoverageData(
      projectID,
      sha,
      reportID,
      filepath,
    );
  }
}
