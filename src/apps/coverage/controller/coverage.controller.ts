import {Controller, Get, Post, Body, Query, Request, UseGuards} from '@nestjs/common'
import { RepoListService } from '../service/repo-list.service'
import { CoverageClientService } from '../service/coverage-client.service'
import { FileContentService } from '../service/file-content.service'
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";

@Controller('coverage')
export class CoverageController {
  constructor(
    private readonly coverageClientService: CoverageClientService,
    private readonly fileContentService: FileContentService,
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
  fileContent(@Query() fileContentDto: any,     @Request() request: { user: { id: number } },) {
    return this.fileContentService.invoke(request.user.id, fileContentDto)
  }
}
