import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common'
import { RepoListService } from '../service/repo-list.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RepoSummaryService } from '../service/repo-summary.service'
import { RepoCoverageService } from '../service/repo-coverage.service'

@UseGuards(JwtAuthGuard)
@Controller('')
export class RepoController {
  constructor(
    private readonly repoListService: RepoListService,
    private readonly repoSummaryService: RepoSummaryService,
    private readonly repoCoverageService: RepoCoverageService,
  ) {}

  //获取个人所有的项目
  // 1.自己所在的项目
  //2.哪些激活了的
  @Get('repo')
  repoList(@Query() query: any, @Request() request: { user: { id: number } }) {
    return this.repoListService.repoList({ currentUser: request.user.id })
  }

  @Get('repo/:thRepoId/coverage')
  listCoverageCommit(
    @Param() param,
    @Request() request: { user: { id: number } },
  ) {
    return this.repoCoverageService.invoke({
      thRepoId: param.thRepoId,
      currentUser: request.user.id,
    })
  }

  @Get('repo/:thRepoId/summary')
  repoSummary(@Param() param, @Request() request: any) {
    console.log(request.headers['lang'])
    return this.repoSummaryService.invoke({
      thRepoId: param.thRepoId,
      currentUser: request.user.id,
      lang: request.headers['lang'],
    })
  }
}
