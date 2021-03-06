import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { CoverageClientService } from '../service/coverage-client.service'
import { FileContentService } from '../service/file-content.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RetrieveCoverageTreeSummaryService } from '../service/retrieve-coverage-tree-summary.service'
import { TriggerAggCoverageService } from '../service/trigger-agg-coverage.service'
import { ListAggStatusService } from '../service/list-agg-status.service'

@Controller('coverage')
export class CoverageController {
  constructor(
    private readonly coverageClientService: CoverageClientService,
    private readonly fileContentService: FileContentService,
    private readonly retrieveCoverageTreeSummaryService: RetrieveCoverageTreeSummaryService,
    private readonly triggerAggCoverageService: TriggerAggCoverageService,
    private readonly listAggStatusService: ListAggStatusService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('client')
  create(
    @Request() request: { user: { id: number } },
    @Body() coverageClientDto: any,
  ) {
    return this.coverageClientService.invoke(request.user.id, coverageClientDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('retrieveACoverageForAProjectService')
  retrieveACoverageForAProjectService(
    @Request() request: { user: { id: number } },
    @Query() query: any,
  ) {
    return this.coverageClientService.retrieveACoverageForAProjectService({
      currentUser: request.user.id,
      ...query,
    })
  }

  // 检索一个项目的某一版本的某个文件的内容，这边需要找出他的覆盖率，通过文件路径
  @UseGuards(JwtAuthGuard)
  @Get('filecontent')
  fileContent(
    @Query() fileContentDto: any,
    @Request() request: { user: { id: number } },
  ) {
    return this.fileContentService.invoke(request.user.id, fileContentDto)
  }

  // 获取概览
  @Get('/treesummary')
  retrieveCoverageTreeSummary(@Query() params: any) {
    return this.retrieveCoverageTreeSummaryService.invoke(params)
  }

  // 获取聚合状态
  @Get('/aggstatus')
  listAggStatus(@Query() params: any) {
    return this.listAggStatusService.invoke(params)
  }

  @Post('/triggeragg')
  triggeragg(@Body() params: any) {
    //commitSha、reportId
    return this.triggerAggCoverageService.invoke(params)
    // 触发聚合覆盖率
  }
}
