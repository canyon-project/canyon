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
import { RepoService } from '../service/repo.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RepoSummaryService } from '../service/repo-summary.service'

@UseGuards(JwtAuthGuard)
@Controller('')
export class RepoController {
  constructor(
    private readonly reposService: RepoService,
    private readonly repoSummaryService: RepoSummaryService,
  ) {}

  //获取个人所有的项目
  // 1.自己所在的项目
  //2.哪些激活了的
  @Get('repo')
  repoList(@Query() query: any, @Request() request: { user: { id: number } }) {
    return this.reposService.repoList({ currentUser: request.user.id })
  }

  @Get('repo/:thRepoId/commit')
  listCoverageCommit(
    @Query() query: any,
    @Param() param,
    @Request() request: { user: { id: number } },
  ) {
    console.log(param, 'param')
    return this.reposService.listCoverageCommit({
      thRepoId: param.thRepoId,
      currentUser: request.user.id,
    })
  }

  @Get('repo/:thRepoId/summary')
  summary(@Param() param, @Request() request: { user: { id: number } }) {
    console.log(param, 'param')
    return this.repoSummaryService.invoke({
      thRepoId: param.thRepoId,
      currentUser: request.user.id,
    })
  }
}
